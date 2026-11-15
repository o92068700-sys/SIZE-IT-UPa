import CategoryCards from '@/components/landing/CategoryCards';
import ComingLab from '@/components/landing/ComingLab';
import Dedication from '@/components/landing/Dedication';
import Footer from '@/components/landing/Footer';
import Hero from '@/components/landing/Hero';
import HowToPlay from '@/components/landing/HowToPlay';
import IntroSequence from '@/components/landing/IntroSequence';
import OnlineSection from '@/components/landing/OnlineSection';
import type { CategoryId } from '@/types/game';

interface LandingPageProps {
  onSelect: (categoryId: CategoryId) => void;
  onOnline: () => void;
}

function scrollToCategories() {
  document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function LandingPage({ onSelect, onOnline }: LandingPageProps) {
  return (
    <>
      <IntroSequence />
      <Hero onStart={scrollToCategories} />
      <HowToPlay />
      <OnlineSection onOnline={onOnline} />
      <CategoryCards onSelect={onSelect} />
      <ComingLab />
      <Dedication />
      <Footer />
    </>
  );
}
