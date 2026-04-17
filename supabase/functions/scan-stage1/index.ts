// @ts-nocheck — Deno Edge Function: URL imports and Deno globals are valid at runtime
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.27.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Always HTTP 200 — errors in { error: "..." } body so client sees the real message
function ok(payload) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return ok({ error: 'Missing authorization header' });

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') ?? '';
    if (!anthropicKey) {
      return ok({ error: 'ANTHROPIC_API_KEY is not set. Run: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...' });
    }

    // Verify the caller's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await callerClient.auth.getUser();
    if (authError || !user) return ok({ error: `Auth failed: ${authError?.message ?? 'invalid token'}` });

    const body = await req.json();
    const {
      session_id,
      front_image_base64,
      front_image_mime,
      back_image_base64,
      back_image_mime,
    } = body;

    if (!front_image_base64) return ok({ error: 'front_image_base64 is required' });

    // Build image content blocks from inline base64
    const imageContent = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: front_image_mime || 'image/jpeg',
          data: front_image_base64,
        },
      },
    ];
    if (back_image_base64) {
      imageContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: back_image_mime || 'image/jpeg',
          data: back_image_base64,
        },
      });
    }

    const promptText = back_image_base64
      ? `You are an expert WNBA trading card identifier. I am providing 2 images: the FRONT first, then the BACK. Use both sides. The back often has the card number, copyright year, and serial number printed clearly. Return ONLY valid JSON.

Identify:
- player_name: full name as printed on the card front
- set_name: full set name (e.g. "2024 Panini Prizm WNBA")
- year: card year as integer
- card_number: card number as string (e.g. "42" or "RC-7") — check the back if unclear on front
- serial_number: if visible on either side, e.g. "47/99" — null if not present
- confidence: your confidence 0.0 to 1.0
- notes: observations useful for parallel identification (border color, finish, shimmer, foil treatment)

Return ONLY JSON, no other text.`
      : `You are an expert WNBA trading card identifier. Analyze the provided card image and return ONLY valid JSON.

Identify:
- player_name: full name as printed on the card
- set_name: full set name (e.g. "2024 Panini Prizm WNBA")
- year: card year as integer
- card_number: card number as string (e.g. "42" or "RC-7")
- serial_number: if visible on card, e.g. "47/99" — null if not present
- confidence: your confidence 0.0 to 1.0
- notes: observations useful for parallel identification (border color, finish, shimmer, foil treatment)

Return ONLY JSON, no other text.`;

    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const stage1Message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: [...imageContent, { type: 'text', text: promptText }] }],
    });

    const stage1Raw = stage1Message.content[0]?.type === 'text' ? stage1Message.content[0].text : '';
    let stage1Result;
    try {
      const cleaned = stage1Raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
      stage1Result = JSON.parse(cleaned);
    } catch {
      return ok({ error: `AI returned unparseable response: ${stage1Raw.slice(0, 300)}` });
    }

    // Match against checklist DB (best-effort — no service role needed, just reading shared data)
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const dbClient = createClient(supabaseUrl, serviceKey || anonKey, { db: { schema: 'wnba_cards' } });

    const lastName = stage1Result.player_name?.split(' ').pop() ?? '';
    const { data: matchedCards } = await dbClient
      .from('cards')
      .select('id, card_number, player_name, team, set_id, sets!inner(id, name, year)')
      .ilike('player_name', `%${lastName}%`)
      .eq('card_number', stage1Result.card_number)
      .limit(5);

    const candidates = [];
    if (matchedCards?.length > 0) {
      matchedCards.slice(0, 3).forEach((card, idx) => {
        const set = card.sets;
        candidates.push({
          rank: idx + 1,
          card_id: card.id,
          parallel_id: null,
          player_name: card.player_name,
          set_name: set?.name ?? stage1Result.set_name,
          year: set?.year ?? stage1Result.year,
          card_number: card.card_number,
          serial_number: stage1Result.serial_number,
          confidence: stage1Result.confidence - idx * 0.05,
          notes: stage1Result.notes,
        });
      });
    }

    if (candidates.length === 0) {
      candidates.push({
        rank: 1,
        card_id: null,
        parallel_id: null,
        player_name: stage1Result.player_name,
        set_name: stage1Result.set_name,
        year: stage1Result.year,
        card_number: stage1Result.card_number,
        serial_number: stage1Result.serial_number,
        confidence: stage1Result.confidence,
        notes: stage1Result.notes,
      });
    }

    // Persist scan results if we have a session (best-effort)
    if (session_id) {
      await dbClient.from('scan_results').insert(
        candidates.map((c) => ({
          session_id,
          rank: c.rank,
          card_id: c.card_id,
          parallel_id: null,
          confidence: c.confidence,
          serial_detected: c.serial_number,
          stage1_response: stage1Result,
        }))
      );
      await dbClient.from('scan_sessions').update({ status: 'identified' }).eq('id', session_id);
    }

    return ok({ session_id, candidates, low_confidence: stage1Result.confidence < 0.5 });

  } catch (err) {
    console.error('scan-stage1 unhandled error:', err);
    return ok({ error: `Unexpected error: ${String(err)}` });
  }
});
