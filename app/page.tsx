import NavBar from '@/components/NavBar';
import Hero from '@/components/Hero';
import USPs from '@/components/USPs';
import MenuPreview from '@/components/MenuPreview';
import Testimonials from '@/components/Testimonials';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function Page() {
  return (
    <>
      <NavBar />
      <Hero />
      <USPs />
      <MenuPreview />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
}
