'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { SectionShell } from '@/components/SectionShell';

export default function ScanPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <SectionShell
      title="Scan"
      description="Prepare the scan workflow for card image upload, AI identification, and confirmation in Phase 2."
    >
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Scan shell</p>
        <p className="mt-3 text-slate-300">This screen will become the camera and upload entrypoint for the Claude Vision identification pipeline.</p>
      </div>
    </SectionShell>
  );
}
