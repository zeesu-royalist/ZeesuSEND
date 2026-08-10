import type { Metadata } from 'next';
import { Martian_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';

const martianMono = Martian_Mono({
  subsets: ['latin'],
  variable: '--font-martian-mono',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://zeesu-send.vercel.app'),
  title: 'Fast & Secure File Transfer | ZeesuSEND',
  description: 'Upload, share & receive files with confidence. End-to-end encryption, auto-expiring links, and zero registration.',
  openGraph: {
    title: 'Fast & Secure File Transfer | ZeesuSEND',
    description: 'Upload, share & receive files with confidence. End-to-end encryption, auto-expiring links, and zero registration.',
    url: 'https://ZeesuSEND.vercel.app',
    siteName: 'ZeesuSEND',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fast & Secure File Transfer | ZeesuSEND',
    description: 'Upload, share & receive files with confidence. End-to-end encryption, auto-expiring links, and zero registration.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${martianMono.variable} font-mono scroll-smooth`}>
      <body className="flex flex-col min-h-screen font-mono bg-[#ffffff] text-[#191314] antialiased selection:bg-[#ecf95a] selection:text-[#191314]">
        <Navbar />
        <main className="flex-1 w-full relative">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
