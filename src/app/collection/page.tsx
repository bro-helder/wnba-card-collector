'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { SectionShell } from '@/components/SectionShell';

export default function CollectionPage() {
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
      title="Collection"
      description="Browse and manage the cards you own. This placeholder is the foundation for collection list, search, and detail views."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Getting started</p>
          <p className="mt-3 text-slate-300">Add cards manually to build your collection and confirm the data model is wired into Supabase.</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Mobile shell</p>
          <p className="mt-3 text-slate-300">This view is designed for one-thumb browsing and fast navigation at a card show.</p>
        </div>
      </div>
    </SectionShell>
  );
}
