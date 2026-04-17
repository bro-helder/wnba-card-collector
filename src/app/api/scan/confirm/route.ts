import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface ConfirmPayload {
  session_id: string | null;
  // Checklist identity — card_id if already in DB, or name fields to auto-create
  card_id: string | null;
  player_name: string;
  set_name: string;
  year: number | null;
  card_number: string;
  // Collection metadata
  parallel_id: string | null;
  serial_number: string | null;
  condition: string | null;
  cost_paid: number | null;
  acquisition_date: string | null;
  image_url: string;
}

function createServerClient(authHeader: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      db: { schema: 'wnba_cards' },
      global: { headers: { Authorization: authHeader } },
    }
  );
}

// Find or create a set row. Returns the set id.
async function upsertSet(
  supabase: ReturnType<typeof createServerClient>,
  name: string,
  year: number | null
): Promise<string> {
  // Try to find an existing set with the same name (case-insensitive) and year
  const query = supabase
    .from('sets')
    .select('id')
    .ilike('name', name)
    .limit(1);

  if (year) {
    const { data } = await query.eq('year', year).maybeSingle();
    if (data?.id) return data.id;
  } else {
    const { data } = await query.maybeSingle();
    if (data?.id) return data.id;
  }

  // Create a new set (without needs_review — column may not exist yet if migration pending)
  const { data: newSet, error } = await supabase
    .from('sets')
    .insert({ name, year: year ?? new Date().getFullYear() })
    .select('id')
    .single();

  if (error || !newSet) throw new Error(`Failed to create set "${name}": ${error?.message}`);

  // Best-effort flag — silently ignored if the migration hasn't been run yet
  await supabase.from('sets').update({ needs_review: true } as object).eq('id', newSet.id);

  return newSet.id;
}

// Find or create a card row. Returns the card id.
async function upsertCard(
  supabase: ReturnType<typeof createServerClient>,
  setId: string,
  cardNumber: string,
  playerName: string
): Promise<string> {
  // Try exact match first
  const { data: existing } = await supabase
    .from('cards')
    .select('id')
    .eq('set_id', setId)
    .eq('card_number', cardNumber)
    .maybeSingle();

  if (existing?.id) return existing.id;

  // Create a new card (without needs_review — best-effort flag applied after insert)
  const { data: newCard, error } = await supabase
    .from('cards')
    .insert({ set_id: setId, card_number: cardNumber, player_name: playerName })
    .select('id')
    .single();

  if (error || !newCard) throw new Error(`Failed to create card "${playerName} #${cardNumber}": ${error?.message}`);

  // Best-effort flag — silently ignored if migration hasn't been run yet
  await supabase.from('cards').update({ needs_review: true } as object).eq('id', newCard.id);

  return newCard.id;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient(authHeader);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload: ConfirmPayload = await req.json();
  const {
    session_id,
    card_id: providedCardId,
    player_name,
    set_name,
    year,
    card_number,
    parallel_id,
    serial_number,
    condition,
    cost_paid,
    acquisition_date,
    image_url,
  } = payload;

  if (!player_name || !set_name || !card_number) {
    return NextResponse.json(
      { error: 'player_name, set_name, and card_number are required' },
      { status: 400 }
    );
  }

  // Verify session if provided (non-fatal if missing — scan without storage works too)
  if (session_id) {
    const { data: session } = await supabase
      .from('scan_sessions')
      .select('id, user_id, status')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .single();

    if (session?.status === 'confirmed') {
      return NextResponse.json({ error: 'Session already confirmed' }, { status: 409 });
    }
  }

  // Resolve card_id: use provided ID, or find/create from name fields
  let cardId: string;
  let autoCreated = false;

  if (providedCardId) {
    cardId = providedCardId;
  } else {
    try {
      const setId = await upsertSet(supabase, set_name, year ?? null);
      cardId = await upsertCard(supabase, setId, card_number, player_name);
      autoCreated = true;
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Failed to create checklist entry' },
        { status: 500 }
      );
    }
  }

  // Write to collection
  const { data: collectionEntry, error: collectionError } = await supabase
    .from('collection')
    .insert({
      user_id: user.id,
      card_id: cardId,
      parallel_id: parallel_id ?? null,
      serial_number: serial_number ?? null,
      condition: condition ?? null,
      cost_paid: cost_paid ?? null,
      acquisition_date: acquisition_date ?? null,
      scan_image_url: image_url || null,
      quantity: 1,
    })
    .select('id')
    .single();

  if (collectionError || !collectionEntry) {
    return NextResponse.json(
      { error: 'Failed to add to collection', detail: collectionError?.message },
      { status: 500 }
    );
  }

  // Mark session confirmed if we have one
  if (session_id) {
    await Promise.all([
      supabase.from('scan_sessions').update({ status: 'confirmed' }).eq('id', session_id),
      supabase.from('scan_results').update({ confirmed: true }).eq('session_id', session_id).eq('rank', 1),
    ]);
  }

  return NextResponse.json({ collection_id: collectionEntry.id, auto_created: autoCreated });
}
