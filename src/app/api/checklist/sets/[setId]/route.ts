import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function serverClient(authHeader: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      db: { schema: 'wnba_cards' },
      global: { headers: { Authorization: authHeader } },
    }
  );
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ setId: string }> }) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = serverClient(authHeader);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { setId } = await params;

  const [setResult, parallelsResult, cardsResult] = await Promise.all([
    supabase.from('sets').select('*').eq('id', setId).single(),
    supabase.from('parallels').select('*').eq('set_id', setId).order('sort_order').order('name'),
    supabase.from('cards').select('id, card_number, player_name, team, rookie_card, notes').eq('set_id', setId).order('card_number'),
  ]);

  if (setResult.error) return NextResponse.json({ error: 'Set not found' }, { status: 404 });

  return NextResponse.json({
    set: setResult.data,
    parallels: parallelsResult.data ?? [],
    cards: cardsResult.data ?? [],
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ setId: string }> }) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = serverClient(authHeader);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { setId } = await params;
  const body = await req.json();

  const { data, error } = await supabase
    .from('sets')
    .update(body)
    .eq('id', setId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ set: data });
}
