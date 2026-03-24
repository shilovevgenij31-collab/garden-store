import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Catalog from "@/components/Catalog";
import AboutSection from "@/components/AboutSection";
import AdvantagesSection from "@/components/AdvantagesSection";
import HowToOrderSection from "@/components/HowToOrderSection";
import ReviewsSection from "@/components/ReviewsSection";
import ContactsSection from "@/components/ContactsSection";
import Footer from "@/components/Footer";
import { useInView } from "@/hooks/useInView";

const Index = () => {
  useInView();

  return (
    <>
      <Header />
      <Hero />
      <AboutSection />
      <Catalog />
      <AdvantagesSection />
      <HowToOrderSection />
      <ReviewsSection />
      <ContactsSection />
      <Footer />
    </>
  );
};

export default Index;
