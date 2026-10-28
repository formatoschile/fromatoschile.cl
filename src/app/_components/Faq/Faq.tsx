import { JsonLd } from "@/components/JsonLd/JsonLd";
import { Accordion } from "@/components/ui/Accordion/Accordion";
import { buildFaqJsonLd } from "@/lib/seo/jsonLd";

import { faqs, HOME_FAQ_COUNT } from "./faqs";

const homeFaqs = faqs.slice(0, HOME_FAQ_COUNT);

export const Faq: React.FC = () => {
  return (
    <section className="section-inset bg-white py-20">
      <JsonLd data={buildFaqJsonLd(homeFaqs)} />

      <div className="mx-auto max-w-7xl">
        <h2 className="text-ink text-4xl font-normal sm:text-5xl">FAQ</h2>

        <Accordion entries={homeFaqs} />
      </div>
    </section>
  );
};
