import { Faq } from "@/components/sections/Faq/Faq";
import { LegalGuidance } from "@/components/sections/LegalGuidance/LegalGuidance";
import { DocumentCategories } from "./_components/DocumentCategories/DocumentCategories";
import { FeaturedTemplates } from "./_components/FeaturedTemplates/FeaturedTemplates";
import { HomeHero } from "./_components/HomeHero/HomeHero";
import { HowItWorks } from "./_components/HowItWorks/HowItWorks";
import { SecuritySection } from "./_components/SecuritySection/SecuritySection";

export const metadata = {
  title: "formatos.cl",
  description: "El mejor e-commerce de contractos de Chile",
  openGraph: {
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-primary text-neutral-800">
      <HomeHero />
      <DocumentCategories />
      <FeaturedTemplates />
      <SecuritySection />
      <HowItWorks />
      <Faq />
      <LegalGuidance />
    </div>
  );
}
