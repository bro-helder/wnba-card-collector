'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { SectionShell } from '@/components/SectionShell';

export default function ProfilePage() {
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
      title="Profile"
      description="Manage your display name, alert email, and account preferences for Supabase-authenticated collection tracking."
    >
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Account setup</p>
        <p className="mt-3 text-slate-300">First login will create a profile row. Future auth flows can sync display name and email preferences here.</p>
      </div>
    </SectionShell>
  );
}
