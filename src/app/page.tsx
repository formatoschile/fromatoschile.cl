import { Suspense } from "react";

import { DocumentCategories } from "./_components/DocumentCategories/DocumentCategories";
import { Faq } from "./_components/Faq/Faq";
import { FeaturedTemplates } from "./_components/FeaturedTemplates/FeaturedTemplates";
import { HomeHero } from "./_components/HomeHero/HomeHero";
import { HowItWorks } from "./_components/HowItWorks/HowItWorks";
import { LegalGuidance } from "./_components/LegalGuidance/LegalGuidance";
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
      {/* Data-backed sections stream in without blocking the hero. */}
      <Suspense fallback={null}>
        <DocumentCategories />
      </Suspense>
      <Suspense fallback={null}>
        <FeaturedTemplates />
      </Suspense>
      <SecuritySection />
      <HowItWorks />
      <Faq />
      <LegalGuidance />
    </div>
  );
}
