'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  CaretRight,
  CircleNotch,
  Warning,
  X,
} from '@phosphor-icons/react';
import { supabase } from '@/lib/supabaseClient';
import { processCardImage, type ProcessedImage } from '@/lib/imageProcessing';

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

function confBadge(score: number): { label: string; color: string } {
  if (score >= 0.8) return { label: 'HIGH', color: '#00C9A7' };
  if (score >= 0.5) return { label: 'MEDIUM', color: '#F5A623' };
  return { label: 'LOW', color: '#E8373A' };
}

const CONDITIONS = ['Mint', 'Near Mint', 'Excellent', 'Good', 'Fair', 'Poor', 'Raw'];

// ─── ScanHeader ───────────────────────────────────────────────────────────────

function ScanHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div style={{ padding: '56px 16px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              width: 36, height: 36, borderRadius: 9999,
              background: '#161618', border: '1px solid #2A2A2F',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
            aria-label="Back"
          >
            <ArrowLeft size={14} color="#F5F5F7" />
          </button>
        )}
        <div style={{
          fontFamily: 'var(--font-body), Inter, sans-serif',
          fontSize: 11, fontWeight: 600, color: '#FF4713',
          letterSpacing: 2, textTransform: 'uppercase',
        }}>Scan Card</div>
      </div>
      <div style={{
        fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
        fontWeight: 800, fontSize: 34, lineHeight: 1,
        textTransform: 'uppercase', letterSpacing: 0.3,
        color: '#F5F5F7',
      }}>{title}</div>
    </div>
  );
}

// ─── Zone (capture zone for front/back image) ─────────────────────────────────

interface ZoneProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  subtitle?: string;
  small?: boolean;
  preview: string | null;
  processing: boolean;
  onCamera: () => void;
  onLibrary: () => void;
  onClear: () => void;
}

function Zone({ label, required, optional, subtitle, small, preview, processing, onCamera, onLibrary, onClear }: ZoneProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 8 }}>
        <div style={{
          fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
          fontWeight: 700, fontSize: 13, letterSpacing: 2,
          textTransform: 'uppercase', color: '#F5F5F7',
        }}>
          {label}
          {required && <span style={{ color: '#FF4713', marginLeft: 6, fontSize: 10 }}>REQUIRED</span>}
          {optional && <span style={{ color: '#8E8E9A', marginLeft: 6, fontSize: 10 }}>OPTIONAL</span>}
        </div>
      </div>

      {/* Zone box */}
      <div style={{
        aspectRatio: small ? '7 / 3' : '5 / 4',
        background: '#161618',
        border: preview ? '1px solid #2A2A2F' : '2px dashed #2A2A2F',
        borderRadius: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 10,
        position: 'relative', overflow: 'hidden',
      }}>
        {!preview ? (
          /* Empty state */
          <>
            <div style={{
              width: 48, height: 48, borderRadius: 9999,
              background: required ? '#FF471326' : '#1F1F23',
              border: `1px solid ${required ? '#FF471399' : '#2A2A2F'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke={required ? '#FF4713' : '#8E8E9A'} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h3l2-3h8l2 3h3v12H3z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <div style={{
              fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
              fontWeight: 700, fontSize: 14, letterSpacing: 1,
              textTransform: 'uppercase', color: '#F5F5F7',
            }}>Tap to photograph</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ label: 'Camera', fn: onCamera }, { label: 'Library', fn: onLibrary }].map(({ label: l, fn }) => (
                <button key={l} onClick={fn} style={{
                  padding: '6px 14px', borderRadius: 8,
                  background: '#1F1F23', border: '1px solid #2A2A2F',
                  fontSize: 12, fontWeight: 600, color: '#F5F5F7',
                  textTransform: 'uppercase', letterSpacing: 0.5, cursor: 'pointer',
                  fontFamily: 'var(--font-body), Inter, sans-serif',
                }}>{l}</button>
              ))}
            </div>
          </>
        ) : (
          /* Has image */
          <>
            <Image src={preview} alt={label} fill style={{ objectFit: 'contain' }} />
            {processing ? (
              /* Processing overlay */
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(10,10,11,0.72)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 10,
              }}>
                <CircleNotch size={26} color="#FF4713" style={{ animation: 'spin 1s linear infinite' }} />
                <div style={{
                  fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
                  fontSize: 13, fontWeight: 700, letterSpacing: 1,
                  textTransform: 'uppercase', color: '#F5F5F7',
                }}>Compressing…</div>
              </div>
            ) : (
              /* Clear button */
              <button onClick={onClear} style={{
                position: 'absolute', top: 10, right: 10,
                width: 30, height: 30, borderRadius: 9999,
                background: 'rgba(10,10,11,0.85)', border: '1px solid #2A2A2F',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }} aria-label="Remove image">
                <X size={14} color="#8E8E9A" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Subtitle / status badge */}
      {!preview && subtitle && (
        <div style={{ fontSize: 11, color: '#8E8E9A', marginTop: 6 }}>{subtitle}</div>
      )}
      {preview && !processing && (
        <div style={{ fontSize: 11, marginTop: 6, color: '#8E8E9A' }}>✓ Compressed</div>
      )}
    </div>
  );
}

// ─── ProcessingSteps ──────────────────────────────────────────────────────────

function ProcessingSteps({ stage, frontPreview }: { stage: ScanStage; frontPreview: string | null }) {
  const steps = [
    { key: 'uploading',   label: 'Uploading…',            sub: 'Sending to secure storage' },
    { key: 'identifying', label: 'Identifying card…',     sub: 'Analyzing player, set, and card number' },
    { key: 'classifying', label: 'Classifying parallel…', sub: 'Matching border color, finish, and print run' },
  ];
  const order = ['uploading', 'identifying', 'classifying'];
  const currentIdx = order.indexOf(stage);

  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Card with pulse ring */}
      {frontPreview && (
        <div style={{ position: 'relative', marginBottom: 36, width: 160 }}>
          <div style={{ aspectRatio: '5 / 7', position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: -12, borderRadius: 16,
              background: 'radial-gradient(circle, rgba(255,71,19,0.25) 0%, transparent 65%)',
            }} />
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 12,
              border: '2px solid #FF4713',
              animation: 'alertPulse 1.6s ease-in-out infinite',
              zIndex: 2,
            }} />
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', height: '100%', zIndex: 1 }}>
              <Image src={frontPreview} alt="Card" fill style={{ objectFit: 'contain', background: '#0A0A0B' }} />
            </div>
          </div>
        </div>
      )}

      {/* Step list */}
      <div style={{ width: '100%', maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {steps.map((step, i) => {
          const isDone = i < currentIdx;
          const isActive = i === currentIdx;
          return (
            <div key={step.key} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              opacity: isDone ? 0.8 : isActive ? 1 : 0.3,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 9999, flexShrink: 0,
                background: isDone ? '#00C9A7' : isActive ? '#FF4713' : '#1F1F23',
                border: `1px solid ${isDone ? '#00C9A7' : isActive ? '#FF4713' : '#2A2A2F'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isDone && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                    stroke="#0A0A0B" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M2 6l3 3 5-6"/>
                  </svg>
                )}
                {isActive && <div style={{ width: 8, height: 8, borderRadius: 9999, background: '#fff' }} />}
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
                  fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5,
                  color: '#F5F5F7',
                }}>{step.label}</div>
                {isActive && (
                  <div style={{ fontSize: 11, color: '#8E8E9A', marginTop: 2 }}>{step.sub}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
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

function ManualEntryForm({ fields, setFields, sessionId, frontImagePath, getAuthHeader, onSuccess, onError }: ManualEntryFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!fields.player_name || !fields.set_name || !fields.card_number) {
      onError('Player name, set, and card number are required.');
      return;
    }
    setSubmitting(true);
    try {
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
      <div style={{
        background: '#3D2800', border: '1px solid #F5A62399',
        borderRadius: 10, padding: '10px 12px',
        fontSize: 12, color: '#F5A623',
      }}>
        AI couldn't identify this card. Enter details by hand.
      </div>
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
      <button onClick={handleSubmit} disabled={submitting}
        className="h-14 w-full rounded-xl bg-[#FF4713] text-white font-semibold text-base hover:bg-[#E63D0F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
        {submitting && <CircleNotch size={18} className="animate-spin" />}
        Add to Collection
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ScanPage() {
  const router = useRouter();
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const activeInput = useRef<'front' | 'back'>('front');
  // Token refs for cancelling stale async processing results
  const frontToken = useRef(0);
  const backToken = useRef(0);

  const [stage, setStage] = useState<ScanStage>('idle');
  const [error, setError] = useState<string | null>(null);

  // Image state — preview = display URL, scanFile = compressed file for AI
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [frontScanFile, setFrontScanFile] = useState<File | null>(null);
  const [frontProcessing, setFrontProcessing] = useState(false);

  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [backScanFile, setBackScanFile] = useState<File | null>(null);
  const [backProcessing, setBackProcessing] = useState(false);

  // Scan pipeline state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [frontImagePath, setFrontImagePath] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<ScanCandidate[]>([]);
  const [parallelCandidates, setParallelCandidates] = useState<ParallelCandidate[]>([]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [lowConfidence, setLowConfidence] = useState(false);
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [fields, setFields] = useState<ConfirmFields>({
    player_name: '', set_name: '', card_number: '',
    parallel_id: '', parallel_name: '',
    serial_number: '', condition: 'Near Mint',
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

  // File selected → show original immediately, kick off compress + bg removal
  const handleFileSelected = useCallback((side: 'front' | 'back', file: File) => {
    const MAX_RAW = 25 * 1024 * 1024; // 25MB — prevent browser from choking
    if (file.size > MAX_RAW) {
      setError('Please select a smaller image (under 25 MB).');
      return;
    }

    const token = side === 'front' ? ++frontToken.current : ++backToken.current;
    const originalUrl = URL.createObjectURL(file);

    if (side === 'front') {
      setFrontPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return originalUrl; });
      setFrontFile(file);
      setFrontScanFile(null);
      setFrontProcessing(true);

      processCardImage(file).then((result: ProcessedImage) => {
        if (frontToken.current !== token) { URL.revokeObjectURL(result.previewUrl); return; }
        URL.revokeObjectURL(originalUrl);
        setFrontPreview(result.previewUrl);
        setFrontScanFile(result.file);
        setFrontProcessing(false);
      }).catch(() => {
        if (frontToken.current !== token) return;
        setFrontScanFile(file);
        setFrontProcessing(false);
      });
    } else {
      setBackPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return originalUrl; });
      setBackFile(file);
      setBackScanFile(null);
      setBackProcessing(true);

      processCardImage(file).then((result: ProcessedImage) => {
        if (backToken.current !== token) { URL.revokeObjectURL(result.previewUrl); return; }
        URL.revokeObjectURL(originalUrl);
        setBackPreview(result.previewUrl);
        setBackScanFile(result.file);
        setBackProcessing(false);
      }).catch(() => {
        if (backToken.current !== token) return;
        setBackScanFile(file);
        setBackProcessing(false);
      });
    }
  }, []);

  const clearFront = useCallback(() => {
    ++frontToken.current;
    setFrontPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setFrontFile(null); setFrontScanFile(null); setFrontProcessing(false);
  }, []);

  const clearBack = useCallback(() => {
    ++backToken.current;
    setBackPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setBackFile(null); setBackScanFile(null); setBackProcessing(false);
  }, []);

  const handleScan = useCallback(async () => {
    const scanFront = frontScanFile ?? frontFile;
    if (!scanFront) return;
    const scanBack = backScanFile ?? backFile;
    setError(null);
    setStage('uploading');

    try {
      const authHeader = await getAuthHeader();

      const toBase64 = async (f: File) => {
        const buffer = await f.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        return { base64: btoa(binary), mimeType: f.type || 'image/jpeg' };
      };

      const frontB64 = await toBase64(scanFront);
      const backB64 = scanBack ? await toBase64(scanBack) : null;

      let session_id: string | null = null;
      let front_image_path: string | null = null;
      try {
        const form = new FormData();
        form.append('front', scanFront);
        if (scanBack) form.append('back', scanBack);
        const uploadRes = await fetch('/api/scan/upload', {
          method: 'POST',
          headers: { Authorization: authHeader },
          body: form,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) { session_id = uploadData.session_id; front_image_path = uploadData.front_image_path; }
      } catch { /* Storage upload non-fatal */ }
      setSessionId(session_id);
      setFrontImagePath(front_image_path);
      setStage('identifying');

      const { data: stage1Data, error: stage1Error } = await supabase.functions.invoke('scan-stage1', {
        body: {
          session_id,
          front_image_base64: frontB64.base64, front_image_mime: frontB64.mimeType,
          back_image_base64: backB64?.base64 ?? null, back_image_mime: backB64?.mimeType ?? null,
        },
      });
      if (stage1Error) throw new Error(`Edge Function unreachable — ensure functions are deployed.\n(${stage1Error.message})`);
      if (stage1Data?.error) throw new Error(stage1Data.error);

      const { candidates: stage1Candidates, low_confidence } = stage1Data;
      setCandidates(stage1Candidates);
      setLowConfidence(low_confidence);
      setCandidateIndex(0);

      const topCandidate: ScanCandidate = stage1Candidates[0];
      if (topCandidate?.card_id) {
        setStage('classifying');
        const { data: cardData } = await supabase.from('cards').select('set_id').eq('id', topCandidate.card_id).single();
        const { data: stage2Data } = await supabase.functions.invoke('scan-stage2', {
          body: {
            session_id, card_id: topCandidate.card_id, set_id: cardData?.set_id ?? null,
            player_name: topCandidate.player_name, set_name: topCandidate.set_name,
            year: topCandidate.year, card_number: topCandidate.card_number,
            serial_detected: topCandidate.serial_number,
            front_image_base64: frontB64.base64, front_image_mime: frontB64.mimeType,
            back_image_base64: backB64?.base64 ?? null, back_image_mime: backB64?.mimeType ?? null,
          },
        });
        if (stage2Data?.parallel_candidates) setParallelCandidates(stage2Data.parallel_candidates);
      }

      setStage('confirming');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStage('idle');
    }
  }, [frontScanFile, frontFile, backScanFile, backFile, getAuthHeader]);

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
          card_id: candidates[candidateIndex]?.card_id ?? null,
          player_name: fields.player_name, set_name: fields.set_name,
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
      player_name: '', set_name: '', card_number: '',
      parallel_id: '', parallel_name: '',
      serial_number: '', condition: 'Near Mint',
      cost_paid: '', acquisition_date: new Date().toISOString().split('T')[0],
    });
    setStage('manual');
  }, []);

  const reset = useCallback(() => {
    ++frontToken.current; ++backToken.current;
    setFrontPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setBackPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setFrontFile(null); setFrontScanFile(null); setFrontProcessing(false);
    setBackFile(null); setBackScanFile(null); setBackProcessing(false);
    setStage('idle'); setError(null);
    setSessionId(null); setFrontImagePath(null);
    setCandidates([]); setParallelCandidates([]);
    setCandidateIndex(0); setLowConfidence(false);
    setReasoningOpen(false); setConfirming(false);
  }, []);

  const currentCandidate = candidates[candidateIndex];
  const isProcessing = stage === 'uploading' || stage === 'identifying' || stage === 'classifying';
  const scanReady = !!frontFile && !frontProcessing;
  const { label: confLabel, color: confColor } = currentCandidate ? confBadge(currentCandidate.confidence) : { label: '', color: '' };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: '#0A0A0B', minHeight: '100vh', color: '#F5F5F7', paddingBottom: 100 }}>

      {/* Header */}
      <ScanHeader
        title={
          stage === 'confirming' ? 'Confirm Card'
          : stage === 'manual' ? 'Manual Entry'
          : stage === 'success' ? 'Added!'
          : isProcessing ? 'Working'
          : 'New Pull'
        }
        onBack={stage === 'confirming' || stage === 'manual' ? reset : undefined}
      />

      {/* Error banner */}
      {error && (
        <div style={{
          margin: '0 16px 16px',
          display: 'flex', alignItems: 'flex-start', gap: 10,
          borderRadius: 12, border: '1px solid rgba(232,55,58,0.3)',
          background: 'rgba(232,55,58,0.08)', padding: '12px 14px',
        }}>
          <Warning size={18} color="#E8373A" style={{ marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: '#FFB3B5', flex: 1, lineHeight: 1.4 }}>{error}</p>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <X size={14} color="#E8373A" />
          </button>
        </div>
      )}

      {/* ── IDLE ── */}
      {stage === 'idle' && (
        <div style={{ padding: '0 16px' }}>
          <Zone
            label="Front of card" required
            preview={frontPreview} processing={frontProcessing}
            onCamera={() => triggerPicker('front', 'camera')}
            onLibrary={() => triggerPicker('front', 'library')}
            onClear={clearFront}
          />
          <Zone
            label="Back of card" optional small
            subtitle="Helps identify card number, serial & copyright year"
            preview={backPreview} processing={backProcessing}
            onCamera={() => triggerPicker('back', 'camera')}
            onLibrary={() => triggerPicker('back', 'library')}
            onClear={clearBack}
          />

          <button
            onClick={handleScan}
            disabled={!scanReady}
            style={{
              width: '100%', height: 56, borderRadius: 12, border: 'none',
              background: scanReady ? '#FF4713' : '#2A2A2F',
              color: scanReady ? '#fff' : '#45454E',
              cursor: scanReady ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
              fontSize: 18, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2,
              marginTop: 18, transition: 'background 200ms, color 200ms',
            }}
          >
            {frontProcessing ? 'Processing image…' : frontFile ? 'Identify Card →' : 'Add front photo to continue'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#8E8E9A' }}>
            AI identifies player, set, parallel, and serial in ~3s.
          </div>

          {/* Hidden file inputs */}
          <input ref={frontInputRef} type="file" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelected('front', f); e.target.value = ''; }} />
          <input ref={backInputRef} type="file" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelected('back', f); e.target.value = ''; }} />
        </div>
      )}

      {/* ── PROCESSING ── */}
      {isProcessing && (
        <ProcessingSteps stage={stage} frontPreview={frontPreview} />
      )}

      {/* ── CONFIRMING ── */}
      {stage === 'confirming' && currentCandidate && (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Low-confidence banner */}
          {lowConfidence && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              borderRadius: 10, border: '1px solid rgba(245,166,35,0.4)',
              background: '#3D2800', padding: '10px 12px',
            }}>
              <Warning size={16} color="#F5A623" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: '#F5A623' }}>Low confidence — review carefully before confirming.</p>
            </div>
          )}

          {/* Dot nav + confidence */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {candidates.map((_, i) => (
                  <div key={i} onClick={() => setCandidateIndex(i)} style={{
                    width: i === candidateIndex ? 20 : 6, height: 6, borderRadius: 9999,
                    background: i === candidateIndex ? '#FF4713' : '#2A2A2F',
                    transition: 'width 200ms', cursor: 'pointer',
                  }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: '#8E8E9A', fontWeight: 600 }}>
                Candidate {candidateIndex + 1} of {candidates.length}
              </div>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 9px', borderRadius: 9999,
              background: `${confColor}26`, border: `1px solid ${confColor}99`,
              color: confColor, fontSize: 10, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 1,
            }}>● {confLabel}</div>
          </div>

          {/* Card preview */}
          <div style={{
            background: '#161618', border: '1px solid #1F1F23',
            borderRadius: 14, overflow: 'hidden',
          }}>
            {/* Photo(s) */}
            <div style={{ display: 'flex' }}>
              {frontPreview && (
                <div style={{ flex: 1, aspectRatio: '5 / 7', position: 'relative' }}>
                  <Image src={frontPreview} alt="Front" fill style={{ objectFit: 'contain', background: '#0A0A0B' }} />
                </div>
              )}
              {backPreview && (
                <div style={{ flex: 1, aspectRatio: '5 / 7', position: 'relative', borderLeft: '1px solid #2A2A2F' }}>
                  <Image src={backPreview} alt="Back" fill style={{ objectFit: 'contain', background: '#0A0A0B' }} />
                </div>
              )}
            </div>

            {/* Card info */}
            <div style={{ padding: '14px 14px 10px' }}>
              <div style={{
                fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
                fontWeight: 800, fontSize: 20, lineHeight: 1.1,
                textTransform: 'uppercase', marginBottom: 4,
              }}>{currentCandidate.player_name}</div>
              <div style={{ fontSize: 12, color: '#8E8E9A', marginBottom: 10 }}>
                {currentCandidate.set_name} · #{currentCandidate.card_number}
                {currentCandidate.serial_number && ` · ${currentCandidate.serial_number}`}
              </div>
              {parallelCandidates[0] && (
                <div style={{
                  display: 'inline-block', padding: '3px 8px', borderRadius: 6,
                  border: '1px solid #3D3D45', background: '#1F1F23',
                  fontSize: 11, fontWeight: 600, color: '#8E8E9A',
                  textTransform: 'uppercase', letterSpacing: 0.5,
                }}>{parallelCandidates[0].parallel_name}</div>
              )}

              {/* AI Reasoning accordion */}
              {currentCandidate.notes && (
                <button
                  onClick={() => setReasoningOpen((o) => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'none', border: 'none', cursor: 'pointer',
                    marginTop: 10, padding: 0, color: '#8E8E9A',
                  }}
                >
                  <CaretRight size={14} color="#8E8E9A"
                    style={{ transform: reasoningOpen ? 'rotate(90deg)' : 'none', transition: 'transform 150ms' }} />
                  <span style={{
                    fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
                    fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
                    textTransform: 'uppercase',
                  }}>AI Reasoning</span>
                  <span style={{ fontSize: 10, color: '#45454E' }}>
                    {(currentCandidate.confidence * 100).toFixed(0)}%
                  </span>
                </button>
              )}
              {reasoningOpen && (
                <div style={{
                  marginTop: 8, borderRadius: 8,
                  background: '#1F1F23', border: '1px solid #2A2A2F',
                  padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  <p style={{ fontSize: 12, color: '#8E8E9A', lineHeight: 1.5, margin: 0 }}>
                    {currentCandidate.notes}
                  </p>
                  {parallelCandidates[0]?.reasoning && (
                    <p style={{ fontSize: 12, color: '#8E8E9A', lineHeight: 1.5, margin: 0 }}>
                      <span style={{ color: '#F5F5F7' }}>Parallel: </span>
                      {parallelCandidates[0].reasoning}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Editable fields */}
          <div style={{
            background: '#161618', border: '1px solid #1F1F23',
            borderRadius: 14, padding: 14,
          }}>
            <div style={{
              fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
              fontWeight: 700, fontSize: 11, letterSpacing: 2,
              textTransform: 'uppercase', color: '#8E8E9A', marginBottom: 14,
            }}>Review &amp; Edit</div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Parallel">
                  <input type="text" value={fields.parallel_name || fields.parallel_id}
                    onChange={(e) => setFields((f) => ({ ...f, parallel_name: e.target.value }))}
                    className="input-field" />
                </Field>
                <Field label="Serial #">
                  <input type="text" value={fields.serial_number} placeholder="e.g. 47/99"
                    onChange={(e) => setFields((f) => ({ ...f, serial_number: e.target.value }))}
                    className="input-field" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Condition">
                  <select value={fields.condition}
                    onChange={(e) => setFields((f) => ({ ...f, condition: e.target.value }))}
                    className="input-field">
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Cost Paid ($)">
                  <input type="number" step="0.01" min="0" value={fields.cost_paid} placeholder="0.00"
                    onChange={(e) => setFields((f) => ({ ...f, cost_paid: e.target.value }))}
                    className="input-field" />
                </Field>
              </div>
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
                <Field label="Date">
                  <input type="date" value={fields.acquisition_date}
                    onChange={(e) => setFields((f) => ({ ...f, acquisition_date: e.target.value }))}
                    className="input-field" />
                </Field>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 8 }}>
            <button
              onClick={handleConfirm} disabled={confirming}
              style={{
                width: '100%', height: 56, borderRadius: 12, border: 'none',
                background: confirming ? '#CC3810' : '#FF4713', color: '#fff',
                cursor: confirming ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
                fontSize: 18, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 150ms',
              }}
            >
              {confirming && <CircleNotch size={18} style={{ animation: 'spin 1s linear infinite' }} />}
              Confirm · Add to Collection
            </button>
            {!currentCandidate.card_id && (
              <p style={{ fontSize: 12, color: '#8E8E9A', textAlign: 'center' }}>
                Not in checklist — will be added automatically and flagged for review.
              </p>
            )}
            <button onClick={handleManualEntry} style={{
              width: '100%', height: 48, borderRadius: 12,
              border: '1px solid #2A2A2F', background: 'transparent',
              color: '#8E8E9A', cursor: 'pointer',
              fontFamily: 'var(--font-body), Inter, sans-serif',
              fontSize: 13, fontWeight: 500,
              transition: 'color 150ms, border-color 150ms',
            }}>
              None of these — Manual Entry
            </button>
          </div>
        </div>
      )}

      {/* ── MANUAL ENTRY ── */}
      {stage === 'manual' && (
        <div style={{ padding: '0 16px' }}>
          <ManualEntryForm
            fields={fields} setFields={setFields}
            sessionId={sessionId} frontImagePath={frontImagePath}
            getAuthHeader={getAuthHeader}
            onSuccess={() => setStage('success')}
            onError={setError}
          />
        </div>
      )}

      {/* ── SUCCESS ── */}
      {stage === 'success' && (
        <div style={{
          padding: '0 16px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center', paddingTop: 20,
        }}>
          {/* Card with glow burst */}
          <div style={{ position: 'relative', marginBottom: 24, width: 200 }}>
            <div style={{ aspectRatio: '5 / 7', position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: -40, borderRadius: 9999,
                background: 'radial-gradient(circle, rgba(0,201,167,0.35) 0%, transparent 60%)',
                filter: 'blur(10px)',
              }} />
              <div style={{
                position: 'absolute', inset: -80, borderRadius: 9999,
                background: 'radial-gradient(circle, rgba(255,215,0,0.12) 0%, transparent 70%)',
              }} />
              <div style={{
                position: 'relative', borderRadius: 14,
                overflow: 'hidden', height: '100%', zIndex: 1,
              }} className="tilt-card">
                {frontPreview ? (
                  <Image src={frontPreview} alt="Added card" fill style={{ objectFit: 'contain', background: '#161618' }} />
                ) : (
                  <div style={{ height: '100%', background: '#161618', border: '1px solid #2A2A2F', borderRadius: 14 }} />
                )}
              </div>
            </div>
            {/* Teal checkmark badge */}
            <div style={{
              position: 'absolute', bottom: -10, right: -10,
              width: 44, height: 44, borderRadius: 9999, zIndex: 2,
              background: '#00C9A7', border: '3px solid #0A0A0B',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,201,167,0.5)',
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
                stroke="#0A0A0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 9l3 3 7-8"/>
              </svg>
            </div>
          </div>

          <div style={{
            fontFamily: 'var(--font-body), Inter, sans-serif',
            fontSize: 11, fontWeight: 700, color: '#00C9A7',
            letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4,
          }}>★ Added to the Vault</div>
          <div style={{
            fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
            fontWeight: 800, fontSize: 28, lineHeight: 1,
            textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6,
          }}>
            {fields.player_name || 'Card'}
            {fields.card_number && ` · #${fields.card_number}`}
          </div>
          <div style={{ fontSize: 13, color: '#8E8E9A', marginBottom: 28 }}>
            {fields.set_name}
            {fields.serial_number && ` · ${fields.serial_number}`}
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360 }}>
            <button onClick={reset} style={{
              width: '100%', height: 52, borderRadius: 12, border: 'none',
              background: '#FF4713', color: '#fff', cursor: 'pointer',
              fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
              fontSize: 17, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2,
            }}>Scan Another Card</button>
            <button onClick={() => router.push('/collection')} style={{
              width: '100%', height: 52, borderRadius: 12,
              border: '1px solid #2A2A2F', background: 'transparent',
              color: '#8E8E9A', cursor: 'pointer',
              fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
              fontSize: 17, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2,
            }}>View Collection</button>
          </div>
        </div>
      )}
    </div>
  );
}
