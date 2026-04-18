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
  const url = new URL(req.url);
  const search = url.searchParams.get('q') ?? '';
  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const pageSize = 50;

  let query = supabase
    .from('cards')
    .select('id, card_number, player_name, team, rookie_card, notes', { count: 'exact' })
    .eq('set_id', setId)
    .order('card_number');

  if (search) {
    query = query.or(`player_name.ilike.%${search}%,card_number.ilike.%${search}%`);
  }

  const { data, error, count } = await query.range((page - 1) * pageSize, page * pageSize - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ cards: data ?? [], total: count ?? 0, page, pageSize });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ setId: string }> }) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = serverClient(authHeader);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { setId } = await params;
  const body = await req.json();
  const { card_number, player_name, team, rookie_card, notes } = body;

  if (!card_number || !player_name) {
    return NextResponse.json({ error: 'card_number and player_name are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('cards')
    .insert({
      set_id: setId,
      card_number,
      player_name,
      team: team ?? null,
      rookie_card: rookie_card ?? false,
      notes: notes ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ card: data });
}
