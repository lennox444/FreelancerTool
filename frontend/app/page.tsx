import { Metadata } from 'next';
import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Testimonials } from '@/components/landing/Testimonials';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'FreelanceFlow - All-in-One Tool für Freelancer',
  description: 'Verwalte deine Angebote, Projekte und Zahlungen an einem Ort. Das ultimative Tool für Freelancer und Selbstständige.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
