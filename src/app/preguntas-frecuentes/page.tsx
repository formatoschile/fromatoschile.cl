import type { Metadata } from "next";

import { JsonLd } from "@/components/JsonLd/JsonLd";
import { Accordion } from "@/components/ui/Accordion/Accordion";
import { buildFaqJsonLd } from "@/lib/seo/jsonLd";

import { faqs } from "../_components/Faq/faqs";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Resolvemos tus dudas sobre nuestras plantillas de contratos y documentos legales para Chile: compra, descarga, edición y asesoría legal.",
  alternates: {
    canonical: "/preguntas-frecuentes",
  },
};

export default function FaqPage() {
  return (
    <div className="bg-primary text-ink min-h-dvh pt-20">
      <JsonLd data={buildFaqJsonLd(faqs)} />

      <section className="section-inset bg-white py-20">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-ink text-4xl font-normal sm:text-5xl">
            Preguntas frecuentes
          </h1>

          <Accordion entries={faqs} />
        </div>
      </section>
    </div>
  );
}
