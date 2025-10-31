import './globals.css';
import type { Metadata } from 'next';
import { inter, marcellus } from './fonts';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

export const metadata: Metadata = {
  title: 'AV Food Factory — Lucknow Catering | Nawabi Dastarkhwan',
  description: 'Premium Lucknow catering with a Nawabi touch. Weddings, corporate, and private events.',
  icons: { icon: '/favicon.ico' }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${marcellus.variable}`}>
      <body className="bg-nawab-ivory text-nawab-ink antialiased">
        <NavBar />
        {children}
        <WhatsAppButton />
        <Footer />
      </body>
    </html>
  );
}
