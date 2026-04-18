'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  ArrowLeft,
  MagnifyingGlass,
  Plus,
  CircleNotch,
  Star,
} from '@phosphor-icons/react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SetDetail {
  id: string;
  name: string;
  year: number;
  manufacturer: string | null;
  needs_review: boolean;
}

interface ParallelRow {
  id: string;
  name: string;
  print_run: number | null;
  is_numbered: boolean;
  is_base: boolean;
  sort_order: number;
  color_description: string | null;
  finish_description: string | null;
  notes: string | null;
  short_code: string | null;
}

interface CardRow {
  id: string;
  card_number: string;
  player_name: string;
  team: string | null;
  rookie_card: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  const t = data.session?.access_token;
  return t ? `Bearer ${t}` : null;
}

function parallelColor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('gold vinyl') || n.includes('black finite')) return '#C9A84C';
  if (n.includes('gold ice')) return '#F0C040';
  if (n.includes('gold')) return '#FFD700';
  if (n.includes('silver')) return '#D4D4E0';
  if (n.includes('blue pulsar') || n.includes('blue velocity')) return '#2C65D4';
  if (n.includes('blue')) return '#4A9EE8';
  if (n.includes('green pulsar')) return '#1A9A52';
  if (n.includes('green')) return '#2ECC71';
  if (n.includes('red pulsar')) return '#C0392B';
  if (n.includes('red')) return '#E74C3C';
  if (n.includes('orange pulsar') || n.includes('orange velocity')) return '#CA6F1E';
  if (n.includes('orange')) return '#E67E22';
  if (n.includes('purple')) return '#9B59B6';
  if (n.includes('teal')) return '#1ABC9C';
  if (n.includes('white')) return '#E8EAF6';
  if (n.includes('mojo')) return '#9B59B6';
  if (n.includes('black')) return '#888888';
  if (n.includes('pink')) return '#FF69B4';
  if (n.includes('cherry blossom') || n.includes('lotus')) return '#C9A0DC';
  return '#A8A8B3';
}

// ---------------------------------------------------------------------------
// Add Parallel Modal
// ---------------------------------------------------------------------------

function AddParallelModal({
  setId,
  onClose,
  onCreated,
}: {
  setId: string;
  onClose: () => void;
  onCreated: (p: ParallelRow) => void;
}) {
  const [name, setName] = useState('');
  const [printRun, setPrintRun] = useState('');
  const [isBase, setIsBase] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const token = await getToken();
    if (!token) { setError('Not authenticated'); setSaving(false); return; }

    const pr = printRun ? parseInt(printRun, 10) : null;
    const res = await fetch(`/api/checklist/sets/${setId}/parallels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify({ name, print_run: pr, is_numbered: pr != null, is_base: isBase }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { setError(json.error ?? 'Failed'); return; }
    onCreated(json.parallel);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl bg-[#1F1F23] p-6 sm:rounded-3xl" onClick={e => e.stopPropagation()}>
        <h2 className="mb-4 font-display text-xl font-bold uppercase tracking-wider text-white">Add Parallel</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input className="input-field" placeholder="Parallel name (e.g. Silver)" value={name} onChange={e => setName(e.target.value)} required />
          <input className="input-field" placeholder="Print run (leave blank if unlimited)" type="number" value={printRun} onChange={e => setPrintRun(e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-[#8E8E9A]">
            <input type="checkbox" checked={isBase} onChange={e => setIsBase(e.target.checked)} className="accent-[#FF4713]" />
            Base parallel (non-foil/non-refractor)
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#2A2A2F] py-3 text-sm font-medium text-[#8E8E9A]">Cancel</button>
            <button type="submit" disabled={saving || !name} className="flex-1 rounded-xl bg-[#FF4713] py-3 text-sm font-semibold text-white disabled:opacity-50">
              {saving ? 'Saving…' : 'Add Parallel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Card Modal
// ---------------------------------------------------------------------------

function AddCardModal({
  setId,
  onClose,
  onCreated,
}: {
  setId: string;
  onClose: () => void;
  onCreated: (c: CardRow) => void;
}) {
  const [cardNumber, setCardNumber] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [team, setTeam] = useState('');
  const [rookieCard, setRookieCard] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const token = await getToken();
    if (!token) { setError('Not authenticated'); setSaving(false); return; }

    const res = await fetch(`/api/checklist/sets/${setId}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify({ card_number: cardNumber, player_name: playerName, team: team || null, rookie_card: rookieCard }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { setError(json.error ?? 'Failed'); return; }
    onCreated(json.card);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl bg-[#1F1F23] p-6 sm:rounded-3xl" onClick={e => e.stopPropagation()}>
        <h2 className="mb-4 font-display text-xl font-bold uppercase tracking-wider text-white">Add Card</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex gap-3">
            <input className="input-field w-24" placeholder="#" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required />
            <input className="input-field flex-1" placeholder="Player name" value={playerName} onChange={e => setPlayerName(e.target.value)} required />
          </div>
          <input className="input-field" placeholder="Team" value={team} onChange={e => setTeam(e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-[#8E8E9A]">
            <input type="checkbox" checked={rookieCard} onChange={e => setRookieCard(e.target.checked)} className="accent-[#FF4713]" />
            Rookie card (RC)
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#2A2A2F] py-3 text-sm font-medium text-[#8E8E9A]">Cancel</button>
            <button type="submit" disabled={saving || !cardNumber || !playerName} className="flex-1 rounded-xl bg-[#FF4713] py-3 text-sm font-semibold text-white disabled:opacity-50">
              {saving ? 'Saving…' : 'Add Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Parallels Tab
// ---------------------------------------------------------------------------

function ParallelsTab({ parallels, setId, onParallelAdded }: { parallels: ParallelRow[]; setId: string; onParallelAdded: (p: ParallelRow) => void }) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="pt-2">
      <div className="mb-3 flex justify-end">
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 rounded-xl bg-[#1F1F23] px-3 py-2 text-sm font-medium text-white hover:bg-[#2A2A2F]">
          <Plus size={14} /> Add Parallel
        </button>
      </div>

      {parallels.length === 0 ? (
        <p className="py-10 text-center text-sm text-[#8E8E9A]">No parallels yet.</p>
      ) : (
        <div className="space-y-2">
          {parallels.map(p => {
            const color = parallelColor(p.name);
            return (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-[#2A2A2F] bg-[#161618] p-3">
                <div
                  className="h-7 w-7 shrink-0 rounded-full"
                  style={{ backgroundColor: `${color}26`, border: `2px solid ${color}99` }}
                />
                <div className="flex-1 min-w-0">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wider"
                    style={{ backgroundColor: `${color}26`, color, border: `1px solid ${color}99` }}
                  >
                    {p.name}
                  </span>
                  {p.is_base && <span className="ml-2 text-xs text-[#8E8E9A]">Base</span>}
                </div>
                <div className="text-right text-xs text-[#8E8E9A]">
                  {p.is_numbered && p.print_run ? `/${p.print_run}` : 'Unlimited'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <AddParallelModal setId={setId} onClose={() => setShowAdd(false)} onCreated={onParallelAdded} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cards Tab
// ---------------------------------------------------------------------------

function CardsTab({ setId, initialCards, totalCards }: { setId: string; initialCards: CardRow[]; totalCards: number }) {
  const [cards, setCards] = useState<CardRow[]>(initialCards);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(totalCards);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  async function fetchCards(q: string, p: number) {
    setLoading(true);
    const token = await getToken();
    if (!token) { setLoading(false); return; }

    const params = new URLSearchParams({ page: String(p) });
    if (q) params.set('q', q);

    const res = await fetch(`/api/checklist/sets/${setId}/cards?${params}`, {
      headers: { Authorization: token },
    });
    const json = await res.json();
    setLoading(false);
    if (res.ok) {
      setCards(json.cards ?? []);
      setTotal(json.total ?? 0);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchCards(search, 1);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function handlePageChange(next: number) {
    setPage(next);
    fetchCards(search, next);
  }

  const pageSize = 50;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="pt-2">
      <div className="mb-3 flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E9A]" />
          <input
            className="input-field pl-9"
            placeholder="Search by player or #"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 rounded-xl bg-[#1F1F23] px-3 py-2 text-sm font-medium text-white hover:bg-[#2A2A2F]">
          <Plus size={14} /> Add
        </button>
      </div>

      <p className="mb-2 text-xs text-[#8E8E9A]">{total} cards total</p>

      {loading ? (
        <div className="flex justify-center py-8">
          <CircleNotch size={24} className="animate-spin text-[#FF4713]" />
        </div>
      ) : cards.length === 0 ? (
        <p className="py-10 text-center text-sm text-[#8E8E9A]">No cards found.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#2A2A2F]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A2A2F] bg-[#1F1F23] text-left text-xs font-semibold uppercase tracking-wider text-[#8E8E9A]">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Player</th>
                <th className="hidden px-3 py-2 sm:table-cell">Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2F] bg-[#161618]">
              {cards.map(c => (
                <tr key={c.id} className="hover:bg-[#1F1F23]">
                  <td className="px-3 py-2 font-mono text-xs text-[#8E8E9A]">{c.card_number}</td>
                  <td className="px-3 py-2 font-medium text-white">
                    {c.player_name}
                    {c.rookie_card && (
                      <Star size={12} weight="fill" className="ml-1 inline text-[#F5A623]" />
                    )}
                  </td>
                  <td className="hidden px-3 py-2 text-[#8E8E9A] sm:table-cell">{c.team ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-xl border border-[#2A2A2F] px-4 py-2 text-[#8E8E9A] disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-[#8E8E9A]">{page} / {totalPages}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded-xl border border-[#2A2A2F] px-4 py-2 text-[#8E8E9A] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {showAdd && (
        <AddCardModal
          setId={setId}
          onClose={() => setShowAdd(false)}
          onCreated={c => { setCards(prev => [c, ...prev]); setTotal(t => t + 1); }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type Tab = 'parallels' | 'cards';

export default function SetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const setId = params.setId as string;

  const [set, setSet] = useState<SetDetail | null>(null);
  const [parallels, setParallels] = useState<ParallelRow[]>([]);
  const [cards, setCards] = useState<CardRow[]>([]);
  const [totalCards, setTotalCards] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('parallels');

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return; }

      const res = await fetch(`/api/checklist/sets/${setId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      setLoading(false);
      if (!res.ok) { router.push('/checklist'); return; }

      setSet(json.set);
      setParallels(json.parallels ?? []);
      setCards(json.cards?.slice(0, 50) ?? []);
      setTotalCards(json.cards?.length ?? 0);
    });
  }, [router, setId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <CircleNotch size={32} className="animate-spin text-[#FF4713]" />
      </div>
    );
  }

  if (!set) return null;

  return (
    <main className="mx-auto max-w-2xl px-4 pb-28 pt-6">
      {/* Back + header */}
      <button onClick={() => router.push('/checklist')} className="mb-4 flex items-center gap-1.5 text-sm text-[#8E8E9A] hover:text-white">
        <ArrowLeft size={16} /> Checklists
      </button>

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#FF4713]">
          {set.year}{set.manufacturer ? ` · ${set.manufacturer}` : ''}
        </p>
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide text-white sm:text-3xl">
          {set.name}
        </h1>
        <p className="mt-1 text-sm text-[#8E8E9A]">
          {parallels.length} parallels · {totalCards} cards
        </p>
      </div>

      {/* Tab bar */}
      <div className="mb-2 flex gap-1 rounded-2xl bg-[#161618] p-1">
        {([['parallels', `Parallels (${parallels.length})`], ['cards', `Cards (${totalCards})`]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
              tab === key ? 'bg-[#FF4713] text-white' : 'text-[#8E8E9A] hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'parallels' && (
        <ParallelsTab
          parallels={parallels}
          setId={setId}
          onParallelAdded={p => setParallels(prev => [...prev, p])}
        />
      )}
      {tab === 'cards' && (
        <CardsTab setId={setId} initialCards={cards} totalCards={totalCards} />
      )}
    </main>
  );
}
