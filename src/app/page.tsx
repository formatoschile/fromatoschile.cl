import { Suspense } from "react";

import { DocumentCategories } from "./_components/DocumentCategories/DocumentCategories";
import { DocumentCategoriesSkeleton } from "./_components/DocumentCategories/DocumentCategoriesSkeleton";
import { Faq } from "./_components/Faq/Faq";
import { FeaturedTemplates } from "./_components/FeaturedTemplates/FeaturedTemplates";
import { FeaturedTemplatesSkeleton } from "./_components/FeaturedTemplates/FeaturedTemplatesSkeleton";
import { HomeHero } from "./_components/HomeHero/HomeHero";
import { HowItWorks } from "./_components/HowItWorks/HowItWorks";
import { LegalGuidance } from "./_components/LegalGuidance/LegalGuidance";
import { SecuritySection } from "./_components/SecuritySection/SecuritySection";

export const metadata = {
  title: "Contratos y documentos legales para Chile",
  description:
    "Plantillas de contratos y documentos legales redactados por profesionales, adaptados a la normativa chilena. Descarga inmediata en PDF, listos para completar y firmar.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div className="bg-primary text-ink min-h-dvh">
      <HomeHero />
      {/* Data-backed sections stream in without blocking the hero. */}
      <Suspense fallback={<DocumentCategoriesSkeleton />}>
        <DocumentCategories />
      </Suspense>

      <Suspense fallback={<FeaturedTemplatesSkeleton />}>
        <FeaturedTemplates />
      </Suspense>

      <SecuritySection />

      <HowItWorks />

      <Faq />

      <LegalGuidance />
    </div>
  );
}
