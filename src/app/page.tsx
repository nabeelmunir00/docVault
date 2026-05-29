import HeroSection from "@/components/landing/HeroSection";
import Navbar from "@/components/Navbar";
import StatsSection from "@/components/landing/StatsSection";
import TrustedBySection from "@/components/landing/TrustedBySection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        {/* <TrustedBySection /> */}
        <FeaturesSection />
        <TestimonialsSection />

        <FAQSection />
        <CTASection />
        <Footer />
      </main>
    </>
  );
}
