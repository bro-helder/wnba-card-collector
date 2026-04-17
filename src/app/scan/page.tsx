'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Camera,
  Image as ImageIcon,
  ArrowLeft,
  CheckCircle,
  Warning,
  CaretRight,
  CaretLeft,
  CircleNotch,
  X,
  Plus,
} from '@phosphor-icons/react';
import { supabase } from '@/lib/supabaseClient';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScanCandidate {
  rank: number;
  card_id: string | null;
  parallel_id: string | null;
  player_name: string;
  set_name: string;
  year: number;
  card_number: string;
  serial_number: string | null;
  confidence: number;
  notes: string;
}

interface ParallelCandidate {
  parallel_id: string;
  parallel_name: string;
  confidence: number;
  reasoning: string;
}

type ScanStage =
  | 'idle'
  | 'uploading'
  | 'identifying'
  | 'classifying'
  | 'confirming'
  | 'success'
  | 'manual';

interface ConfirmFields {
  player_name: string;
  set_name: string;
  card_number: string;
  parallel_id: string;
  parallel_name: string;
  serial_number: string;
  condition: string;
  cost_paid: string;
  acquisition_date: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function confidenceLabel(score: number): { label: string; color: string } {
  if (score >= 0.8) return { label: 'HIGH', color: 'text-teal-400 bg-teal-400/10 border-teal-400/40' };
  if (score >= 0.5) return { label: 'MEDIUM', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/40' };
  return { label: 'LOW', color: 'text-red-400 bg-red-400/10 border-red-400/40' };
}

const CONDITIONS = ['Mint', 'Near Mint', 'Excellent', 'Good', 'Fair', 'Poor', 'Raw'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScanPage() {
  const router = useRouter();
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const activeInput = useRef<'front' | 'back'>('front');

  const [stage, setStage] = useState<ScanStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [frontImagePath, setFrontImagePath] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<ScanCandidate[]>([]);
  const [parallelCandidates, setParallelCandidates] = useState<ParallelCandidate[]>([]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [lowConfidence, setLowConfidence] = useState(false);
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [fields, setFields] = useState<ConfirmFields>({
    player_name: '',
    set_name: '',
    card_number: '',
    parallel_id: '',
    parallel_name: '',
    serial_number: '',
    condition: 'Near Mint',
    cost_paid: '',
    acquisition_date: new Date().toISOString().split('T')[0],
  });

  // Auth guard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) router.push('/login');
    });
    return () => subscription.unsubscribe();
  }, [router]);

  // Populate editable fields when candidate or parallel changes
  useEffect(() => {
    const candidate = candidates[candidateIndex];
    if (!candidate) return;
    const topParallel = parallelCandidates[0];
    setFields((prev) => ({
      ...prev,
      player_name: candidate.player_name,
      set_name: candidate.set_name,
      card_number: candidate.card_number,
      serial_number: candidate.serial_number ?? '',
      parallel_id: topParallel?.parallel_id ?? candidate.parallel_id ?? '',
      parallel_name: topParallel?.parallel_name ?? '',
    }));
  }, [candidateIndex, candidates, parallelCandidates]);

  const getAuthHeader = useCallback(async (): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    return `Bearer ${session?.access_token ?? ''}`;
  }, []);

  const triggerPicker = useCallback((side: 'front' | 'back', source: 'camera' | 'library') => {
    const ref = side === 'front' ? frontInputRef : backInputRef;
    activeInput.current = side;
    if (!ref.current) return;
    if (source === 'camera') {
      ref.current.setAttribute('capture', 'environment');
    } else {
      ref.current.removeAttribute('capture');
    }
    ref.current.accept = 'image/*';
    ref.current.click();
  }, []);

  const handleFileSelected = useCallback((side: 'front' | 'back', file: File) => {
    // Supabase Edge Function payload limit is ~1MB; base64 overhead is ~33%.
    // 750KB raw → ~1MB base64, which is the safe ceiling.
    const MAX_BYTES = 750 * 1024;
    if (file.size > MAX_BYTES) {
      setError(`Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Please use a photo under 750 KB, or compress it before uploading.`);
      return;
    }
    const url = URL.createObjectURL(file);
    if (side === 'front') {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      setFrontPreview(url);
      setFrontFile(file);
    } else {
      if (backPreview) URL.revokeObjectURL(backPreview);
      setBackPreview(url);
      setBackFile(file);
    }
  }, [frontPreview, backPreview]);

  const handleScan = useCallback(async () => {
    if (!frontFile) return;
    setError(null);
    setStage('uploading');

    try {
      const authHeader = await getAuthHeader();

      // Convert images to base64 on the client — Edge Functions receive them in the
      // request body so they never need to download from Storage.
      const toBase64 = async (file: File) => {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        return { base64: btoa(binary), mimeType: file.type || 'image/jpeg' };
      };

      const frontB64 = await toBase64(frontFile);
      const backB64 = backFile ? await toBase64(backFile) : null;

      // Upload to storage for permanent record — non-fatal if bucket isn't set up yet
      let session_id: string | null = null;
      let front_image_path: string | null = null;
      try {
        const form = new FormData();
        form.append('front', frontFile);
        if (backFile) form.append('back', backFile);
        const uploadRes = await fetch('/api/scan/upload', {
          method: 'POST',
          headers: { Authorization: authHeader },
          body: form,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          session_id = uploadData.session_id;
          front_image_path = uploadData.front_image_path;
        }
      } catch {
        // Storage upload failed — continue without persistent session
      }
      setSessionId(session_id);
      setFrontImagePath(front_image_path);
      setStage('identifying');

      // Stage 1 — image arrives as base64 in the request body
      const { data: stage1Data, error: stage1Error } = await supabase.functions.invoke('scan-stage1', {
        body: {
          session_id,
          front_image_base64: frontB64.base64,
          front_image_mime: frontB64.mimeType,
          back_image_base64: backB64?.base64 ?? null,
          back_image_mime: backB64?.mimeType ?? null,
        },
      });
      if (stage1Error) {
        throw new Error(
          `Edge Function unreachable — ensure functions are deployed: supabase functions deploy scan-stage1 scan-stage2\n\n(${stage1Error.message})`
        );
      }
      if (stage1Data?.error) throw new Error(stage1Data.error);

      const { candidates: stage1Candidates, low_confidence } = stage1Data;
      setCandidates(stage1Candidates);
      setLowConfidence(low_confidence);
      setCandidateIndex(0);

      // Stage 2 — parallel classification (only if we matched a checklist card)
      const topCandidate: ScanCandidate = stage1Candidates[0];
      if (topCandidate?.card_id) {
        setStage('classifying');

        const { data: cardData } = await supabase
          .from('cards')
          .select('set_id')
          .eq('id', topCandidate.card_id)
          .single();

        const { data: stage2Data } = await supabase.functions.invoke('scan-stage2', {
          body: {
            session_id,
            card_id: topCandidate.card_id,
            set_id: cardData?.set_id ?? null,
            player_name: topCandidate.player_name,
            set_name: topCandidate.set_name,
            year: topCandidate.year,
            card_number: topCandidate.card_number,
            serial_detected: topCandidate.serial_number,
            front_image_base64: frontB64.base64,
            front_image_mime: frontB64.mimeType,
            back_image_base64: backB64?.base64 ?? null,
            back_image_mime: backB64?.mimeType ?? null,
          },
        });
        // Stage 2 errors are non-fatal — show candidates without parallel ranking
        if (stage2Data?.parallel_candidates) {
          setParallelCandidates(stage2Data.parallel_candidates);
        }
      }

      setStage('confirming');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStage('idle');
    }
  }, [frontFile, backFile, getAuthHeader]);

  const handleConfirm = useCallback(async () => {
    if (confirming) return;
    setError(null);
    setConfirming(true);

    try {
      const authHeader = await getAuthHeader();
      const res = await fetch('/api/scan/confirm', {
        method: 'POST',
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          // Pass both card_id (if checklist match) AND name fields (for auto-create fallback)
          card_id: candidates[candidateIndex]?.card_id ?? null,
          player_name: fields.player_name,
          set_name: fields.set_name,
          year: candidates[candidateIndex]?.year ?? null,
          card_number: fields.card_number,
          parallel_id: fields.parallel_id || null,
          serial_number: fields.serial_number || null,
          condition: fields.condition || null,
          cost_paid: fields.cost_paid ? parseFloat(fields.cost_paid) : null,
          acquisition_date: fields.acquisition_date || null,
          image_url: frontImagePath ?? '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Confirm failed');
      setStage('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add card. Please try again.');
    } finally {
      setConfirming(false);
    }
  }, [confirming, sessionId, frontImagePath, candidates, candidateIndex, fields, getAuthHeader]);

  const handleManualEntry = useCallback(() => {
    setFields({
      player_name: '',
      set_name: '',
      card_number: '',
      parallel_id: '',
      parallel_name: '',
      serial_number: '',
      condition: 'Near Mint',
      cost_paid: '',
      acquisition_date: new Date().toISOString().split('T')[0],
    });
    setStage('manual');
  }, []);

  const reset = useCallback(() => {
    if (frontPreview) URL.revokeObjectURL(frontPreview);
    if (backPreview) URL.revokeObjectURL(backPreview);
    setStage('idle');
    setError(null);
    setFrontPreview(null);
    setBackPreview(null);
    setFrontFile(null);
    setBackFile(null);
    setSessionId(null);
    setFrontImagePath(null);
    setCandidates([]);
    setParallelCandidates([]);
    setCandidateIndex(0);
    setLowConfidence(false);
    setReasoningOpen(false);
    setConfirming(false);
  }, [frontPreview, backPreview]);

  const currentCandidate = candidates[candidateIndex];

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0A0A0B] pb-28 px-4 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {(stage === 'confirming' || stage === 'manual') && (
          <button
            onClick={reset}
            className="p-2 rounded-full text-[#8E8E9A] hover:text-[#F5F5F7] transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="font-display text-3xl font-extrabold uppercase tracking-wider text-[#F5F5F7]">
          {stage === 'confirming' ? 'Confirm Card'
            : stage === 'manual' ? 'Manual Entry'
            : stage === 'success' ? 'Added!'
            : 'Scan'}
        </h1>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-400/10 p-4">
          <Warning size={20} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── IDLE: front + back capture ── */}
      {stage === 'idle' && (
        <div className="flex flex-col gap-6">
          {/* Front image zone */}
          <ImageZone
            label="Front of card"
            required
            preview={frontPreview}
            onCamera={() => triggerPicker('front', 'camera')}
            onLibrary={() => triggerPicker('front', 'library')}
            onClear={() => { setFrontPreview(null); setFrontFile(null); }}
          />

          {/* Back image zone */}
          <ImageZone
            label="Back of card"
            sublabel="Helps Claude read card number, serial, and copyright"
            preview={backPreview}
            onCamera={() => triggerPicker('back', 'camera')}
            onLibrary={() => triggerPicker('back', 'library')}
            onClear={() => { setBackPreview(null); setBackFile(null); }}
          />

          {/* Scan button — only enabled when front is selected */}
          <button
            onClick={handleScan}
            disabled={!frontFile}
            className="h-14 w-full rounded-xl bg-[#FF4713] text-white font-semibold text-base hover:bg-[#E63D0F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {frontFile ? 'Identify Card' : 'Add front photo to continue'}
          </button>

          {/* Hidden file inputs */}
          <input
            ref={frontInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelected('front', file);
              e.target.value = '';
            }}
          />
          <input
            ref={backInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelected('back', file);
              e.target.value = '';
            }}
          />
        </div>
      )}

      {/* ── UPLOADING / IDENTIFYING / CLASSIFYING ── */}
      {(stage === 'uploading' || stage === 'identifying' || stage === 'classifying') && (
        <div className="flex flex-col items-center gap-6 pt-8">
          <div className="flex gap-4">
            {frontPreview && (
              <div className="relative w-32 aspect-[5/7] rounded-xl overflow-hidden shadow-xl shadow-black/60">
                <Image src={frontPreview} alt="Front" fill className="object-contain bg-[#161618]" />
                <div className="absolute inset-0 rounded-xl border-2 border-[#FF4713] animate-pulse" />
              </div>
            )}
            {backPreview && (
              <div className="relative w-32 aspect-[5/7] rounded-xl overflow-hidden shadow-xl shadow-black/60">
                <Image src={backPreview} alt="Back" fill className="object-contain bg-[#161618]" />
                <div className="absolute inset-0 rounded-xl border-2 border-[#FF4713] animate-pulse" />
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-2">
            <CircleNotch size={28} className="text-[#FF4713] animate-spin" />
            <p className="text-[#F5F5F7] font-medium text-base">
              {stage === 'uploading' && 'Uploading…'}
              {stage === 'identifying' && 'Identifying card…'}
              {stage === 'classifying' && 'Classifying parallel…'}
            </p>
            <p className="text-sm text-[#8E8E9A]">
              {stage === 'identifying' && (backPreview ? 'Analyzing front + back' : 'Analyzing player, set, and card number')}
              {stage === 'classifying' && 'Matching border color and finish'}
            </p>
          </div>
        </div>
      )}

      {/* ── CONFIRMING ── */}
      {stage === 'confirming' && currentCandidate && (
        <div className="flex flex-col gap-5">
          {lowConfidence && (
            <div className="flex items-center gap-2 rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3">
              <Warning size={18} className="text-yellow-400 shrink-0" />
              <p className="text-sm text-yellow-300">Low confidence — review carefully before confirming.</p>
            </div>
          )}

          {candidates.length > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCandidateIndex((i) => Math.max(0, i - 1))}
                disabled={candidateIndex === 0}
                className="p-2 rounded-full text-[#8E8E9A] hover:text-[#F5F5F7] disabled:opacity-30 transition-colors"
              >
                <CaretLeft size={20} />
              </button>
              <span className="text-sm text-[#8E8E9A]">
                Candidate {candidateIndex + 1} of {candidates.length}
              </span>
              <button
                onClick={() => setCandidateIndex((i) => Math.min(candidates.length - 1, i + 1))}
                disabled={candidateIndex === candidates.length - 1}
                className="p-2 rounded-full text-[#8E8E9A] hover:text-[#F5F5F7] disabled:opacity-30 transition-colors"
              >
                <CaretRight size={20} />
              </button>
            </div>
          )}

          {/* Card preview */}
          <div className="rounded-2xl border border-[#2A2A2F] bg-[#161618] overflow-hidden">
            <div className="flex">
              {frontPreview && (
                <div className="relative flex-1 aspect-[5/7]">
                  <Image src={frontPreview} alt="Front" fill className="object-contain bg-[#0A0A0B]" />
                </div>
              )}
              {backPreview && (
                <div className="relative flex-1 aspect-[5/7] border-l border-[#2A2A2F]">
                  <Image src={backPreview} alt="Back" fill className="object-contain bg-[#0A0A0B]" />
                </div>
              )}
            </div>

            <div className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${confidenceLabel(currentCandidate.confidence).color}`}>
                  {confidenceLabel(currentCandidate.confidence).label} CONFIDENCE
                </span>
                {parallelCandidates[0] && (
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#3D3D45] text-[#8E8E9A]">
                    {parallelCandidates[0].parallel_name}
                  </span>
                )}
              </div>
              <p className="font-display text-xl font-bold text-[#F5F5F7]">{currentCandidate.player_name}</p>
              <p className="text-sm text-[#8E8E9A]">
                {currentCandidate.set_name} · #{currentCandidate.card_number}
                {currentCandidate.serial_number && ` · ${currentCandidate.serial_number}`}
              </p>

              {currentCandidate.notes && (
                <button
                  onClick={() => setReasoningOpen((o) => !o)}
                  className="flex items-center gap-1 text-xs text-[#8E8E9A] hover:text-[#F5F5F7] mt-1 transition-colors"
                >
                  <CaretRight size={14} className={`transition-transform ${reasoningOpen ? 'rotate-90' : ''}`} />
                  AI Reasoning
                </button>
              )}
              {reasoningOpen && (
                <div className="mt-1 rounded-lg bg-[#1F1F23] border border-[#2A2A2F] p-3 flex flex-col gap-2">
                  <p className="text-xs text-[#8E8E9A] leading-relaxed">{currentCandidate.notes}</p>
                  {parallelCandidates[0]?.reasoning && (
                    <p className="text-xs text-[#8E8E9A] leading-relaxed">
                      <span className="text-[#F5F5F7]">Parallel: </span>{parallelCandidates[0].reasoning}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Editable fields */}
          <div className="rounded-2xl border border-[#2A2A2F] bg-[#161618] p-4 flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8E8E9A]">Review & Edit</p>

            <Field label="Player Name">
              <input type="text" value={fields.player_name}
                onChange={(e) => setFields((f) => ({ ...f, player_name: e.target.value }))}
                className="input-field" />
            </Field>
            <Field label="Set">
              <input type="text" value={fields.set_name}
                onChange={(e) => setFields((f) => ({ ...f, set_name: e.target.value }))}
                className="input-field" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Card #">
                <input type="text" value={fields.card_number}
                  onChange={(e) => setFields((f) => ({ ...f, card_number: e.target.value }))}
                  className="input-field" />
              </Field>
              <Field label="Serial #">
                <input type="text" value={fields.serial_number} placeholder="e.g. 47/99"
                  onChange={(e) => setFields((f) => ({ ...f, serial_number: e.target.value }))}
                  className="input-field" />
              </Field>
            </div>
            <Field label="Condition">
              <select value={fields.condition}
                onChange={(e) => setFields((f) => ({ ...f, condition: e.target.value }))}
                className="input-field">
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cost Paid ($)">
                <input type="number" step="0.01" min="0" value={fields.cost_paid} placeholder="0.00"
                  onChange={(e) => setFields((f) => ({ ...f, cost_paid: e.target.value }))}
                  className="input-field" />
              </Field>
              <Field label="Date">
                <input type="date" value={fields.acquisition_date}
                  onChange={(e) => setFields((f) => ({ ...f, acquisition_date: e.target.value }))}
                  className="input-field" />
              </Field>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pb-4">
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="h-14 w-full rounded-xl bg-[#FF4713] text-white font-semibold text-base hover:bg-[#E63D0F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {confirming && <CircleNotch size={18} className="animate-spin" />}
              Confirm — Add to Collection
            </button>
            {!currentCandidate.card_id && (
              <p className="text-xs text-[#8E8E9A] text-center">
                Not in checklist — will be added automatically and flagged for review.
              </p>
            )}
            <button
              onClick={handleManualEntry}
              className="h-12 w-full rounded-xl border border-[#2A2A2F] bg-transparent text-[#8E8E9A] font-medium text-sm hover:text-[#F5F5F7] hover:border-[#3D3D45] transition-colors"
            >
              None of these — Manual Entry
            </button>
          </div>
        </div>
      )}

      {/* ── MANUAL ENTRY ── */}
      {stage === 'manual' && (
        <ManualEntryForm
          fields={fields}
          setFields={setFields}
          sessionId={sessionId}
          frontImagePath={frontImagePath}
          getAuthHeader={getAuthHeader}
          onSuccess={() => setStage('success')}
          onError={setError}
        />
      )}

      {/* ── SUCCESS ── */}
      {stage === 'success' && (
        <div className="flex flex-col items-center justify-center gap-6 pt-12">
          <div className="relative">
            {frontPreview && (
              <div className="relative w-44 aspect-[5/7] rounded-xl overflow-hidden shadow-2xl shadow-teal-400/20">
                <Image src={frontPreview} alt="Added card" fill className="object-contain bg-[#161618]" />
              </div>
            )}
            <div className="absolute -bottom-3 -right-3 rounded-full bg-teal-400 p-1.5 shadow-lg">
              <CheckCircle size={24} weight="fill" className="text-[#0A0A0B]" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-display text-2xl font-bold uppercase text-[#F5F5F7]">Added to Collection!</p>
            <p className="text-sm text-[#8E8E9A] mt-1">{fields.player_name || 'Card'} has been saved.</p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <button
              onClick={reset}
              className="h-14 w-full rounded-xl bg-[#FF4713] text-white font-semibold text-base hover:bg-[#E63D0F] transition-colors"
            >
              Scan Another Card
            </button>
            <button
              onClick={() => router.push('/collection')}
              className="h-12 w-full rounded-xl border border-[#2A2A2F] bg-transparent text-[#8E8E9A] font-medium text-sm hover:text-[#F5F5F7] hover:border-[#3D3D45] transition-colors"
            >
              View Collection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ImageZone ────────────────────────────────────────────────────────────────

interface ImageZoneProps {
  label: string;
  sublabel?: string;
  required?: boolean;
  preview: string | null;
  onCamera: () => void;
  onLibrary: () => void;
  onClear: () => void;
}

function ImageZone({ label, sublabel, required, preview, onCamera, onLibrary, onClear }: ImageZoneProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-1.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#8E8E9A]">{label}</p>
        {required && <span className="text-[10px] text-[#FF4713] font-semibold uppercase">Required</span>}
      </div>
      {sublabel && <p className="text-xs text-[#45454E] -mt-1">{sublabel}</p>}

      {preview ? (
        <div className="relative flex justify-center">
          <div className="relative w-40 aspect-[5/7] rounded-xl overflow-hidden shadow-lg shadow-black/60">
            <Image src={preview} alt={label} fill className="object-contain bg-[#161618]" />
          </div>
          <button
            onClick={onClear}
            className="absolute top-2 right-2 rounded-full bg-[#0A0A0B]/80 border border-[#2A2A2F] p-1 text-[#8E8E9A] hover:text-[#F5F5F7] transition-colors"
            aria-label="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={onCamera}
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border border-[#2A2A2F] bg-[#161618] text-[#8E8E9A] text-sm font-medium hover:border-[#3D3D45] hover:text-[#F5F5F7] transition-colors"
          >
            <Camera size={18} />
            Camera
          </button>
          <button
            onClick={onLibrary}
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border border-[#2A2A2F] bg-[#161618] text-[#8E8E9A] text-sm font-medium hover:border-[#3D3D45] hover:text-[#F5F5F7] transition-colors"
          >
            <ImageIcon size={18} />
            Library
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[#8E8E9A] uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

// ─── ManualEntryForm ──────────────────────────────────────────────────────────

interface ManualEntryFormProps {
  fields: ConfirmFields;
  setFields: React.Dispatch<React.SetStateAction<ConfirmFields>>;
  sessionId: string | null;
  frontImagePath: string | null;
  getAuthHeader: () => Promise<string>;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

function ManualEntryForm({
  fields, setFields, sessionId, frontImagePath, getAuthHeader, onSuccess, onError,
}: ManualEntryFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!fields.player_name || !fields.set_name || !fields.card_number) {
      onError('Player name, set, and card number are required.');
      return;
    }
    setSubmitting(true);
    try {
      // Pass card_id: null — confirm route will find or create set + card automatically
      const authHeader = await getAuthHeader();
      const res = await fetch('/api/scan/confirm', {
        method: 'POST',
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          card_id: null,
          player_name: fields.player_name,
          set_name: fields.set_name,
          year: null,
          card_number: fields.card_number,
          parallel_id: fields.parallel_id || null,
          serial_number: fields.serial_number || null,
          condition: fields.condition || null,
          cost_paid: fields.cost_paid ? parseFloat(fields.cost_paid) : null,
          acquisition_date: fields.acquisition_date || null,
          image_url: frontImagePath ?? '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to add card');
      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-[#2A2A2F] bg-[#161618] p-4 flex flex-col gap-4">
        <Field label="Player Name">
          <input type="text" value={fields.player_name} placeholder="e.g. A'ja Wilson"
            onChange={(e) => setFields((f) => ({ ...f, player_name: e.target.value }))}
            className="input-field" />
        </Field>
        <Field label="Set">
          <input type="text" value={fields.set_name} placeholder="e.g. 2024 Panini Prizm WNBA"
            onChange={(e) => setFields((f) => ({ ...f, set_name: e.target.value }))}
            className="input-field" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Card #">
            <input type="text" value={fields.card_number} placeholder="e.g. 42"
              onChange={(e) => setFields((f) => ({ ...f, card_number: e.target.value }))}
              className="input-field" />
          </Field>
          <Field label="Serial #">
            <input type="text" value={fields.serial_number} placeholder="e.g. 47/99"
              onChange={(e) => setFields((f) => ({ ...f, serial_number: e.target.value }))}
              className="input-field" />
          </Field>
        </div>
        <Field label="Condition">
          <select value={fields.condition}
            onChange={(e) => setFields((f) => ({ ...f, condition: e.target.value }))}
            className="input-field">
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cost Paid ($)">
            <input type="number" step="0.01" min="0" value={fields.cost_paid} placeholder="0.00"
              onChange={(e) => setFields((f) => ({ ...f, cost_paid: e.target.value }))}
              className="input-field" />
          </Field>
          <Field label="Date">
            <input type="date" value={fields.acquisition_date}
              onChange={(e) => setFields((f) => ({ ...f, acquisition_date: e.target.value }))}
              className="input-field" />
          </Field>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="h-14 w-full rounded-xl bg-[#FF4713] text-white font-semibold text-base hover:bg-[#E63D0F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {submitting && <CircleNotch size={18} className="animate-spin" />}
        Add to Collection
      </button>
    </div>
  );
}
