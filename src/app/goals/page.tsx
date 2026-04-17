'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { SectionShell } from '@/components/SectionShell';

export default function GoalsPage() {
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
      title="Goals"
      description="Set completion tracking for favorite insert sets, parallels, and player collections."
    >
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Goal progress</p>
        <p className="mt-3 text-slate-300">Goal definitions and progress will help you track what you still need to complete a set.</p>
      </div>
    </SectionShell>
  );
}
