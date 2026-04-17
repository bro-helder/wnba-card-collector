import type { Metadata } from 'next';
import '../styles/globals.css';
import { BottomNav } from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'WNBA Card Collector',
  description: 'Mobile-first WNBA trading card collection tracker with Supabase-backed auth, collection management, and AI-enabled scan workflows.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="min-h-screen pb-28">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
