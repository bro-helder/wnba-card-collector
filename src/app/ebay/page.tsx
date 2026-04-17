'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { SectionShell } from '@/components/SectionShell';

export default function EbayPage() {
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
      title="eBay"
      description="Create the foundation for comps, alerts, and listing-generation workflows."
    >
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Market tools</p>
        <p className="mt-3 text-slate-300">This section will evolve into eBay comps, price alerts, and listing copy generation.</p>
      </div>
    </SectionShell>
  );
}
