'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { SectionShell } from '@/components/SectionShell';

export default function WantListPage() {
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
      title="Want List"
      description="Track cards you want, ordered, or received. This route is the first step toward pipeline status and alerting."
    >
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Pipeline state</p>
        <p className="mt-3 text-slate-300">Want list items will be grouped by status and connect to eBay alerts once the backend is in place.</p>
      </div>
    </SectionShell>
  );
}
