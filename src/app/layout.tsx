import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';

export const metadata: Metadata = {
  title: 'Send Files Securely | ZeesuSend',
  description: 'Share files, images and text using a simple secure transfer key.',
  openGraph: {
    title: 'Send Files Securely | ZeesuSend',
    description: 'Share files, images and text using a simple secure transfer key.',
    url: 'https://zeesusend.vercel.app',
    siteName: 'ZeesuSend',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Send Files Securely | ZeesuSend',
    description: 'Share files, images and text using a simple secure transfer key.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex flex-col min-h-screen antialiased bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 selection:bg-brand-500/30">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative">
          {/* Subtle Ambient Glow Effect */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
