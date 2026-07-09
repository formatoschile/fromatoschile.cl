import Link from "next/link";

import { getProducts } from "@/lib/shopify";

import { TemplateCard } from "./TemplateCard";
import { TemplateCarousel } from "./TemplateCarousel";

const MAX_TEMPLATES = 6;

/** Best-selling products as the homepage "featured templates" rail. */
export const FeaturedTemplates = async () => {
  const products = await getProducts({ sortKey: "BEST_SELLING" });
  const featured = products.slice(0, MAX_TEMPLATES);

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="bg-white px-4 py-16 sm:px-12">
      <TemplateCarousel
        heading={
          <h2 className="font-condensed text-3xl text-neutral-800 sm:text-4xl">
            Plantillas destacadas
          </h2>
        }
      >
        {featured.map((product) => (
          <TemplateCard key={product.id} product={product} />
        ))}
      </TemplateCarousel>

      <Link
        href="/todos-los-documentos"
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-neutral-800 underline underline-offset-4 hover:text-neutral-950"
      >
        Ver Todos los Documentos <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
};
