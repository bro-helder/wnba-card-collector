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

export async function POST(req: NextRequest, { params }: { params: Promise<{ setId: string }> }) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = serverClient(authHeader);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { setId } = await params;
  const body = await req.json();
  const { name, short_code, color_description, finish_description, print_run, is_numbered, is_base, sort_order, notes } = body;

  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

  const { data, error } = await supabase
    .from('parallels')
    .insert({
      set_id: setId,
      name,
      short_code: short_code ?? null,
      color_description: color_description ?? null,
      finish_description: finish_description ?? null,
      print_run: print_run != null ? Number(print_run) : null,
      is_numbered: is_numbered ?? false,
      is_base: is_base ?? false,
      sort_order: sort_order ?? 0,
      notes: notes ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ parallel: data });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ setId: string }> }) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = serverClient(authHeader);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { setId } = await params;
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const { data, error } = await supabase
    .from('parallels')
    .update(updates)
    .eq('id', id)
    .eq('set_id', setId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ parallel: data });
}
