import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatsBar } from "@/components/landing/StatsBar";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ForProvidersSection } from "@/components/landing/ForProvidersSection";
import { ForClientsSection } from "@/components/landing/ForClientsSection";
import { VirtualAccountSection } from "@/components/landing/VirtualAccountSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { Footer } from "@/components/landing/Footer";
import ChatBubble from "@/components/landing/ChatBubble";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <HowItWorksSection />
      <ForProvidersSection />
      <ForClientsSection />
      <VirtualAccountSection />
      <PricingSection />
      <SocialProofSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
      <ChatBubble />
    </main>
  );
}
