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
    <section className="bg-mist py-16">
      <TemplateCarousel
        heading={
          <h2 className="text-ink text-4xl font-normal sm:text-5xl">
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
        className="text-ink border-ink pb-x mt-6 ml-(--inset-x) inline-flex items-center gap-2 border-b text-lg font-normal transition-opacity hover:opacity-70"
      >
        Ver Todos los Documentos <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
};
