import type { Metadata } from 'next';
import { Barlow_Condensed, Inter } from 'next/font/google';
import '../styles/globals.css';
import { BottomNav } from '@/components/BottomNav';

const barlowCondensed = Barlow_Condensed({
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WNBA Card Collector',
  description: 'Mobile-first WNBA trading card collection tracker with AI-powered scan, collection management, and eBay alerts.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-[#0A0A0B] text-[#F5F5F7]">
        <div className="min-h-screen pb-28">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
