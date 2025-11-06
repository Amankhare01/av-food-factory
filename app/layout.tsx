import './globals.css';
import type { Metadata } from 'next';
import { inter, marcellus } from './fonts';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

export const metadata: Metadata = {
  metadataBase: new URL("https://www.avfoodfactory.com"),
  title: {
    default: "AV Food Factory — Premium Catering in Lucknow",
    template: "%s | AV Food Factory Lucknow"
  },
  description:
    "Premium catering service in Lucknow, Uttar Pradesh. Nawabi Dastarkhwan, wedding catering, corporate catering, engagement & birthday party catering. Pure taste, authentic Awadhi, live counters, custom menu & full service event catering.",
  keywords: [
    "Lucknow catering",
    "catering service Lucknow",
    "Nawabi catering",
    "Awadhi catering",
    "wedding catering Lucknow",
    "corporate catering Lucknow",
    "party catering Lucknow",
    "best catering in Lucknow",
    "AV Food Factory",
    "Nawabi Dastarkhwan"
  ],
  openGraph: {
    type: "website",
    url: "https://www.avfoodfactory.com/",
    siteName: "AV Food Factory",
    locale: "en_IN",
    images: [
      {
        url: "https://www.avfoodfactory.com/og.jpg",
        width: 1200,
        height: 630,
        alt: "AV Food Factory — Premium Catering in Lucknow",
      },
    ],
  },
  alternates: {
    canonical: "https://www.avfoodfactory.com/"
  }
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
