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

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = serverClient(authHeader);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: sets, error } = await supabase
    .from('sets')
    .select('id, name, year, manufacturer, notes, needs_review, created_at')
    .order('year', { ascending: false })
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch card and parallel counts per set
  const setIds = (sets ?? []).map(s => s.id);
  const [cardCounts, parallelCounts] = await Promise.all([
    setIds.length > 0
      ? supabase.from('cards').select('set_id').in('set_id', setIds)
      : Promise.resolve({ data: [] }),
    setIds.length > 0
      ? supabase.from('parallels').select('set_id').in('set_id', setIds)
      : Promise.resolve({ data: [] }),
  ]);

  const cardsBySet = (cardCounts.data ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.set_id] = (acc[r.set_id] ?? 0) + 1;
    return acc;
  }, {});
  const parallelsBySet = (parallelCounts.data ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.set_id] = (acc[r.set_id] ?? 0) + 1;
    return acc;
  }, {});

  const enriched = (sets ?? []).map(s => ({
    ...s,
    card_count: cardsBySet[s.id] ?? 0,
    parallel_count: parallelsBySet[s.id] ?? 0,
  }));

  return NextResponse.json({ sets: enriched });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = serverClient(authHeader);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, year, manufacturer, notes } = body;

  if (!name || !year) return NextResponse.json({ error: 'name and year are required' }, { status: 400 });

  const { data, error } = await supabase
    .from('sets')
    .insert({ name, year: Number(year), manufacturer: manufacturer ?? null, notes: notes ?? null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ set: data });
}
