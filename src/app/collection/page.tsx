'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { SectionShell } from '@/components/SectionShell';
import type { Session } from '@supabase/supabase-js';

type RelatedSet = {
  name: string | null;
};

type RelatedCard = {
  card_number: string | null;
  player_name: string | null;
  team: string | null;
  sets: RelatedSet | RelatedSet[] | null;
};

type CollectionCard = {
  id: string;
  quantity: number | null;
  condition: string | null;
  created_at: string | null;
  cards: RelatedCard | RelatedCard[] | null;
};

export default function CollectionPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [collection, setCollection] = useState<CollectionCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    setName: '',
    year: '2024',
    manufacturer: 'Panini',
    cardNumber: '',
    playerName: '',
    team: '',
    condition: 'Near Mint',
    quantity: '1',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
        return;
      }

      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.push('/login');
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (session) {
      loadCollection();
    }
  }, [session]);

  async function loadCollection() {
    setLoading(true);
    const { data, error } = await supabase
      .from('collection')
      .select('id,quantity,condition,created_at,cards(card_number,player_name,team,sets(name))')
      .order('created_at', { ascending: false });

    setLoading(false);

    if (error) {
      setMessage(`Unable to load collection: ${error.message}`);
      return;
    }

    setCollection(data ?? []);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    const { setName, year, manufacturer, cardNumber, playerName, team, condition, quantity } = formValues;
    if (!setName || !cardNumber || !playerName) {
      setMessage('Set name, card number, and player name are required.');
      setLoading(false);
      return;
    }

    const userId = session?.user.id;
    if (!userId) {
      setMessage('Unable to detect user session. Please sign in again.');
      setLoading(false);
      return;
    }

    const { data: existingSet, error: setError } = await supabase
      .from('sets')
      .select('id')
      .eq('name', setName)
      .eq('year', parseInt(year, 10))
      .eq('manufacturer', manufacturer)
      .limit(1)
      .maybeSingle();

    if (setError) {
      setMessage(`Error checking set: ${setError.message}`);
      setLoading(false);
      return;
    }

    let setId = existingSet?.id;

    if (!setId) {
      const { data: insertedSet, error: insertSetError } = await supabase
.from('sets')
        .insert({ name: setName, year: parseInt(year, 10), manufacturer })
        .select('id')
        .single();

      if (insertSetError) {
        setMessage(`Unable to create set: ${insertSetError.message}`);
        setLoading(false);
        return;
      }

      setId = insertedSet.id;
    }

    const { data: existingCard, error: selectCardError } = await supabase
      .from('cards')
      .select('id')
      .eq('set_id', setId)
      .eq('card_number', cardNumber)
      .limit(1)
      .maybeSingle();

    if (selectCardError) {
      setMessage(`Error checking card: ${selectCardError.message}`);
      setLoading(false);
      return;
    }

    let cardId = existingCard?.id;

    if (!cardId) {
      const { data: insertedCard, error: insertCardError } = await supabase
        .from('cards')
        .insert({
          set_id: setId,
          card_number: cardNumber,
          player_name: playerName,
          team,
        })
        .select('id')
        .single();

      if (insertCardError) {
        setMessage(`Unable to create card: ${insertCardError.message}`);
        setLoading(false);
        return;
      }

      cardId = insertedCard.id;
    }

    const { error: insertCollectionError } = await supabase.from('collection').insert({
      user_id: userId,
      card_id: cardId,
      quantity: parseInt(quantity, 10),
      condition,
    });

    setLoading(false);

    if (insertCollectionError) {
      setMessage(`Unable to add card to collection: ${insertCollectionError.message}`);
      return;
    }

    setFormValues({
      setName: '',
      year: '2024',
      manufacturer: 'Panini',
      cardNumber: '',
      playerName: '',
      team: '',
      condition: 'Near Mint',
      quantity: '1',
    });

    setMessage('Card added to your collection successfully.');
    loadCollection();
  }

  return (
    <SectionShell
      title="Collection"
      description="Browse your owned cards and add new cards manually to validate Supabase connectivity."
      action={
        <Link href="/checklist" className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700">
          Manage Checklists
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-glow">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Manual add</p>
            <h2 className="mt-3 text-xl font-semibold text-white">Add a card to collection</h2>
            <p className="mt-2 text-slate-400">Create a set/card reference and save it to your personal collection in Supabase.</p>
          </div>

          {message ? (
            <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200">
              {message}
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm text-slate-300">
              Set name
              <input
                value={formValues.setName}
                onChange={(event) => setFormValues({ ...formValues, setName: event.target.value })}
                placeholder="2024 Panini Prizm WNBA"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-300">
                Year
                <input
                  value={formValues.year}
                  onChange={(event) => setFormValues({ ...formValues, year: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                />
              </label>
              <label className="block text-sm text-slate-300">
                Manufacturer
                <input
                  value={formValues.manufacturer}
                  onChange={(event) => setFormValues({ ...formValues, manufacturer: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                />
              </label>
            </div>

            <label className="block text-sm text-slate-300">
              Card number
              <input
                value={formValues.cardNumber}
                onChange={(event) => setFormValues({ ...formValues, cardNumber: event.target.value })}
                placeholder="#45"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
              />
            </label>

            <label className="block text-sm text-slate-300">
              Player name
              <input
                value={formValues.playerName}
                onChange={(event) => setFormValues({ ...formValues, playerName: event.target.value })}
                placeholder="A'ja Wilson"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
              />
            </label>

            <label className="block text-sm text-slate-300">
              Team
              <input
                value={formValues.team}
                onChange={(event) => setFormValues({ ...formValues, team: event.target.value })}
                placeholder="Las Vegas Aces"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-300">
                Condition
                <input
                  value={formValues.condition}
                  onChange={(event) => setFormValues({ ...formValues, condition: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                />
              </label>
              <label className="block text-sm text-slate-300">
                Quantity
                <input
                  value={formValues.quantity}
                  onChange={(event) => setFormValues({ ...formValues, quantity: event.target.value })}
                  type="number"
                  min={1}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Add to Collection'}
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-glow">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Your collection</p>
            <h2 className="mt-3 text-xl font-semibold text-white">Current cards</h2>
            <p className="mt-2 text-slate-400">This list shows cards that have been saved to Supabase for your account.</p>
          </div>

          {loading && collection.length === 0 ? (
            <p className="text-sm text-slate-500">Loading collection…</p>
          ) : collection.length === 0 ? (
            <p className="text-sm text-slate-500">No cards yet. Add a card above to verify Supabase writes.</p>
          ) : (
            <div className="space-y-4">
              {collection.map((item) => {
                const card = Array.isArray(item.cards) ? item.cards[0] : item.cards;
                const sets = card?.sets;
                const set = Array.isArray(sets) ? sets[0] : sets;
                return (
                  <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{set?.name ?? 'Unknown set'}</p>
                        <p className="mt-1 text-lg font-semibold text-white">{card?.player_name ?? 'Unnamed player'}</p>
                      </div>
                      <div className="text-right text-sm text-slate-400">
                        <p>{card?.card_number ?? '—'}</p>
                        <p>{item.quantity ?? 1}×</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                      <span>{card?.team ?? 'Unknown team'}</span>
                      <span>{item.condition ?? 'No condition'}</span>
                      <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'No date'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SectionShell>
  );
}
