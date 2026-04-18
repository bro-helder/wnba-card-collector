'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  Database,
  UploadSimple,
  Plus,
  CaretRight,
  CheckCircle,
  WarningCircle,
  CircleNotch,
  Cards,
} from '@phosphor-icons/react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SetRow {
  id: string;
  name: string;
  year: number;
  manufacturer: string | null;
  needs_review: boolean;
  card_count: number;
  parallel_count: number;
}

interface ImportResult {
  sets_created: number;
  parallels_created: number;
  cards_created: number;
  inserts_processed: number;
  rows_processed: number;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function authHeader(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? `Bearer ${token}` : null;
}

// ---------------------------------------------------------------------------
// Add Set Modal
// ---------------------------------------------------------------------------

function AddSetModal({ onClose, onCreated }: { onClose: () => void; onCreated: (s: SetRow) => void }) {
  const [name, setName] = useState('');
  const [year, setYear] = useState('2024');
  const [manufacturer, setManufacturer] = useState('Panini');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const token = await authHeader();
    if (!token) { setError('Not authenticated'); setSaving(false); return; }

    const res = await fetch('/api/checklist/sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify({ name, year, manufacturer }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { setError(json.error ?? 'Failed to create set'); return; }
    onCreated({ ...json.set, card_count: 0, parallel_count: 0 });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl bg-[#1F1F23] p-6 sm:rounded-3xl" onClick={e => e.stopPropagation()}>
        <h2 className="mb-4 font-display text-xl font-bold uppercase tracking-wider text-white">New Set</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="input-field"
            placeholder="Set name (e.g. 2024 Panini Prizm WNBA)"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <div className="flex gap-3">
            <input
              className="input-field w-24"
              placeholder="Year"
              type="number"
              value={year}
              onChange={e => setYear(e.target.value)}
              required
            />
            <input
              className="input-field flex-1"
              placeholder="Manufacturer"
              value={manufacturer}
              onChange={e => setManufacturer(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#2A2A2F] py-3 text-sm font-medium text-[#8E8E9A]">Cancel</button>
            <button type="submit" disabled={saving || !name} className="flex-1 rounded-xl bg-[#FF4713] py-3 text-sm font-semibold text-white disabled:opacity-50">
              {saving ? 'Creating…' : 'Create Set'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Import Tab
// ---------------------------------------------------------------------------

function ImportTab() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [setName, setSetName] = useState('2024 Panini Prizm WNBA');
  const [year, setYear] = useState('2024');
  const [manufacturer, setManufacturer] = useState('Panini');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setImporting(true);
    setResult(null);
    setError(null);

    const token = await authHeader();
    if (!token) { setError('Not authenticated'); setImporting(false); return; }

    const fd = new FormData();
    fd.append('file', file);
    fd.append('setName', setName);
    fd.append('year', year);
    fd.append('manufacturer', manufacturer);

    const res = await fetch('/api/checklist/import', {
      method: 'POST',
      headers: { Authorization: token },
      body: fd,
    });
    const json = await res.json();
    setImporting(false);

    if (!res.ok) { setError(json.error ?? 'Import failed'); return; }
    setResult(json);
  }

  return (
    <div className="mx-auto max-w-lg py-4">
      <p className="mb-4 text-sm text-[#8E8E9A]">
        Upload a Beckett-format CSV (columns: Card Set, Card Number, Athlete, Team, Sequence).
        The importer will create one set per insert, extract all parallels, and upsert card entries.
      </p>

      <form onSubmit={handleImport} className="flex flex-col gap-4">
        {/* File picker */}
        <div
          className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-[#2A2A2F] p-6 transition hover:border-[#FF4713]/60"
          onClick={() => fileRef.current?.click()}
        >
          <UploadSimple size={28} className="text-[#8E8E9A]" />
          <p className="text-sm text-[#8E8E9A]">
            {file ? file.name : 'Tap to select CSV file'}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <input
          className="input-field"
          placeholder="Base set name (e.g. 2024 Panini Prizm WNBA)"
          value={setName}
          onChange={e => setSetName(e.target.value)}
          required
        />
        <div className="flex gap-3">
          <input
            className="input-field w-24"
            placeholder="Year"
            type="number"
            value={year}
            onChange={e => setYear(e.target.value)}
            required
          />
          <input
            className="input-field flex-1"
            placeholder="Manufacturer"
            value={manufacturer}
            onChange={e => setManufacturer(e.target.value)}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-[#3D0A0B] p-3 text-sm text-red-400">
            <WarningCircle size={16} weight="fill" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || importing}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#FF4713] py-3 font-semibold text-white disabled:opacity-40"
        >
          {importing
            ? <><CircleNotch size={18} className="animate-spin" /> Importing…</>
            : <><UploadSimple size={18} /> Import CSV</>}
        </button>
      </form>

      {result && (
        <div className="mt-6 rounded-2xl border border-[#2A2A2F] bg-[#161618] p-4">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle size={20} weight="fill" className="text-[#00C9A7]" />
            <span className="font-semibold text-white">Import Complete</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Stat label="Rows processed" value={result.rows_processed} />
            <Stat label="Inserts found" value={result.inserts_processed} />
            <Stat label="Sets created" value={result.sets_created} />
            <Stat label="Parallels created" value={result.parallels_created} />
            <Stat label="Cards created" value={result.cards_created} />
          </div>
          {result.errors.length > 0 && (
            <div className="mt-3 rounded-xl bg-[#3D0A0B] p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-red-400">
                {result.errors.length} warning{result.errors.length > 1 ? 's' : ''}
              </p>
              <ul className="list-inside list-disc space-y-1 text-xs text-red-300">
                {result.errors.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}
                {result.errors.length > 10 && <li>…and {result.errors.length - 10} more</li>}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-[#1F1F23] p-2 text-center">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-[#8E8E9A]">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sets Tab
// ---------------------------------------------------------------------------

function SetsTab({ sets, loading, onAdd }: { sets: SetRow[]; loading: boolean; onAdd: () => void }) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="space-y-3 pt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#1F1F23]" />
        ))}
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Database size={48} className="text-[#2A2A2F]" />
        <p className="text-[#8E8E9A]">No sets yet. Import a CSV or add a set manually.</p>
        <button onClick={onAdd} className="flex items-center gap-2 rounded-xl bg-[#FF4713] px-5 py-2.5 text-sm font-semibold text-white">
          <Plus size={16} /> Add Set
        </button>
      </div>
    );
  }

  // Group by year
  const byYear = sets.reduce<Record<number, SetRow[]>>((acc, s) => {
    if (!acc[s.year]) acc[s.year] = [];
    acc[s.year].push(s);
    return acc;
  }, {});

  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  return (
    <div className="space-y-6 pt-4">
      {years.map(year => (
        <div key={year}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#8E8E9A]">{year}</h3>
          <div className="space-y-2">
            {byYear[year].map(set => (
              <button
                key={set.id}
                onClick={() => router.push(`/checklist/${set.id}`)}
                className="flex w-full items-center gap-4 rounded-2xl border border-[#2A2A2F] bg-[#161618] p-4 text-left transition hover:border-[#FF4713]/40 active:scale-[0.98]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1F1F23]">
                  <Cards size={20} className="text-[#FF4713]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-white">{set.name}</p>
                  <p className="text-xs text-[#8E8E9A]">
                    {set.card_count} cards · {set.parallel_count} parallels
                    {set.manufacturer ? ` · ${set.manufacturer}` : ''}
                  </p>
                </div>
                {set.needs_review && (
                  <span className="shrink-0 rounded-full bg-[#3D2800] px-2 py-0.5 text-xs font-semibold uppercase text-[#F5A623]">Review</span>
                )}
                <CaretRight size={16} className="shrink-0 text-[#45454E]" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type Tab = 'sets' | 'import';

export default function ChecklistPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('sets');
  const [sets, setSets] = useState<SetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return; }
      loadSets(session.access_token);
    });
  }, [router]);

  async function loadSets(token: string) {
    setLoading(true);
    const res = await fetch('/api/checklist/sets', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    setLoading(false);
    if (res.ok) setSets(json.sets ?? []);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-28 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF4713]">Admin</p>
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide text-white">Checklists</h1>
        </div>
        {tab === 'sets' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#FF4713] px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={16} /> Add Set
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="mb-2 flex gap-1 rounded-2xl bg-[#161618] p-1">
        {([['sets', 'Sets'], ['import', 'Import CSV']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
              tab === key
                ? 'bg-[#FF4713] text-white'
                : 'text-[#8E8E9A] hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'sets' && (
        <SetsTab
          sets={sets}
          loading={loading}
          onAdd={() => setShowAddModal(true)}
        />
      )}
      {tab === 'import' && <ImportTab />}

      {showAddModal && (
        <AddSetModal
          onClose={() => setShowAddModal(false)}
          onCreated={s => setSets(prev => [s, ...prev])}
        />
      )}
    </main>
  );
}
