// @ts-nocheck — Deno Edge Function: URL imports and Deno globals are valid at runtime
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.27.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Verify caller's JWT
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await callerClient.auth.getUser();
    if (authError || !user) return ok({ error: `Auth failed: ${authError?.message ?? 'invalid token'}` });

    const body = await req.json();
    const {
      session_id,
      set_id,
      player_name, set_name, year, card_number, serial_detected,
      front_image_base64, front_image_mime,
      back_image_base64, back_image_mime,
    } = body;

    if (!front_image_base64) return ok({ error: 'front_image_base64 is required' });

    const dbClient = createClient(supabaseUrl, serviceKey || anonKey, { db: { schema: 'wnba_cards' } });

    // Fetch parallels for this set, filtering by print_run if serial detected
    let parallelQuery = dbClient
      .from('parallels')
      .select('id, name, color_description, finish_description, print_run, is_numbered, notes')
      .order('sort_order');

    if (set_id) parallelQuery = parallelQuery.eq('set_id', set_id);

    if (serial_detected) {
      const match = serial_detected.match(/\/(\d+)$/);
      if (match) parallelQuery = parallelQuery.eq('print_run', parseInt(match[1], 10));
    }

    const { data: parallels, error: parallelsError } = await parallelQuery;
    if (parallelsError) return ok({ error: `Failed to fetch parallels: ${parallelsError.message}` });

    const hasChecklist = parallels && parallels.length > 0;

    // Build image content blocks from inline base64
    const imageContent = [
      {
        type: 'image',
        source: { type: 'base64', media_type: front_image_mime || 'image/jpeg', data: front_image_base64 },
      },
    ];
    if (back_image_base64) {
      imageContent.push({
        type: 'image',
        source: { type: 'base64', media_type: back_image_mime || 'image/jpeg', data: back_image_base64 },
      });
    }

    let promptText: string;

    if (hasChecklist) {
      const parallelListText = parallels
        .map((p) => {
          const parts = [`ID: ${p.id}`, `Name: ${p.name}`];
          if (p.color_description) parts.push(`Color: ${p.color_description}`);
          if (p.finish_description) parts.push(`Finish: ${p.finish_description}`);
          if (p.print_run) parts.push(`Print run: /${p.print_run}`);
          if (p.notes) parts.push(`Notes: ${p.notes}`);
          return parts.join(' | ');
        })
        .join('\n');

      promptText = `You are classifying the parallel variant of a specific WNBA trading card.

Card identity: ${player_name ?? 'Unknown'} #${card_number ?? 'Unknown'} from ${set_name ?? 'Unknown'} (${year ?? 'Unknown'})${serial_detected ? `\nSerial number detected: ${serial_detected}` : ''}
${back_image_base64 ? '\nI am providing both FRONT and BACK. The front shows the parallel finish; the back confirms card number and serial.' : ''}

Known parallels for this set:
${parallelListText}

Examine the card carefully. Look at border color, foil or refractor finish, serial number, background patterns, and shimmer effects.

Return ONLY valid JSON — top 3 parallel candidates ordered by confidence:
[{ "parallel_id": "...", "parallel_name": "...", "confidence": 0.0, "reasoning": "..." }]

If you cannot identify any parallel, return []. Return ONLY the JSON array, no other text.`;
    } else {
      // No checklist — ask Claude to free-form describe what it sees
      promptText = `You are identifying the parallel variant of a WNBA trading card. No checklist is available, so describe what you observe.

Card identity: ${player_name ?? 'Unknown'} #${card_number ?? 'Unknown'} from ${set_name ?? 'Unknown'} (${year ?? 'Unknown'})${serial_detected ? `\nSerial number detected: ${serial_detected}` : ''}
${back_image_base64 ? '\nI am providing both FRONT and BACK.' : ''}

Examine the card carefully. Look at border color, foil finish, refractor pattern, serial number stamp, background shimmer, and any text on the card identifying the parallel.

Name this parallel based on what you see (e.g. "Silver Prizm", "Gold /10", "Base", "Red White and Blue"). Use industry-standard Panini/Prizm naming conventions where applicable.

Return ONLY valid JSON — your best guess plus up to 2 alternatives:
[{ "parallel_id": null, "parallel_name": "...", "confidence": 0.0, "reasoning": "..." }]

If you truly cannot determine the parallel, return []. Return ONLY the JSON array, no other text.`;
    }

    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const stage2Message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: [...imageContent, { type: 'text', text: promptText }] }],
    });

    const stage2Raw = stage2Message.content[0]?.type === 'text' ? stage2Message.content[0].text : '[]';
    let parallelCandidates = [];
    try {
      const cleaned = stage2Raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
      parallelCandidates = JSON.parse(cleaned);
      if (!Array.isArray(parallelCandidates)) parallelCandidates = [];
    } catch {
      parallelCandidates = [];
    }

    // Update rank-1 scan result with Stage 2 data (best-effort)
    if (session_id) {
      const { data: existingResult } = await dbClient
        .from('scan_results')
        .select('id')
        .eq('session_id', session_id)
        .eq('rank', 1)
        .single();

      if (existingResult) {
        await dbClient
          .from('scan_results')
          .update({
            parallel_id: parallelCandidates[0]?.parallel_id ?? null,
            confidence: parallelCandidates[0]?.confidence ?? null,
            stage2_response: parallelCandidates,
          })
          .eq('id', existingResult.id);
      }
    }

    return ok({
      session_id,
      parallel_candidates: parallelCandidates.slice(0, 3),
      unknown_parallel: parallelCandidates.length === 0 || (parallelCandidates[0]?.confidence ?? 0) < 0.3,
    });

  } catch (err) {
    console.error('scan-stage2 unhandled error:', err);
    return ok({ error: `Unexpected error: ${String(err)}` });
  }
});
