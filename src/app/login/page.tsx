'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { SectionShell } from '@/components/SectionShell';

export default function LoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/collection');
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/collection');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const signIn = async () => {
    setErrorMessage(null);
    setIsSigningIn(true);

    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });

    if (error) {
      setErrorMessage(error.message);
      setIsSigningIn(false);
    }
    // Success will be handled by the auth state change listener
  };

  return (
    <SectionShell
      title="Sign In"
      description="Authenticate with Google Oauth using Supabase to create your profile and access the collection tracker."
    >
      <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-glow">
        <button
          type="button"
          onClick={signIn}
          disabled={isSigningIn}
          className="inline-flex w-full items-center justify-center rounded-3xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSigningIn ? 'Starting Google sign-in…' : 'Sign in with Google'}
        </button>
        {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}
        <p className="text-sm text-slate-400">
          After sign-in, your profile row can be created automatically, and session state will persist for the mobile app.
        </p>
      </div>
    </SectionShell>
  );
}
