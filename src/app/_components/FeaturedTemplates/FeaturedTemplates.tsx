import Link from "next/link";

import { TrackViewItemList } from "@/components/Analytics/TrackViewItemList";
import { ITEM_LISTS, toAnalyticsItem } from "@/lib/analytics";
import { getProducts } from "@/lib/shopify";

import { TemplateCard } from "./TemplateCard";
import { TemplateCarousel } from "./TemplateCarousel";

const MAX_TEMPLATES = 6;

/** Best-selling products as the homepage "featured templates" rail. */
export const FeaturedTemplates: React.FC = async () => {
  const featured = await getProducts({
    sortKey: "BEST_SELLING",
    first: MAX_TEMPLATES,
  });

  if (featured.length === 0) {
    return null;
  }

  const analyticsItems = featured.map((product, index) =>
    toAnalyticsItem({ product, listName: ITEM_LISTS.featuredHome, index })
  );

  return (
    <section className="bg-mist py-16">
      <TrackViewItemList
        listName={ITEM_LISTS.featuredHome}
        items={analyticsItems}
      />
      <TemplateCarousel
        heading={
          <h2 className="text-ink text-4xl font-normal sm:text-5xl">
            Plantillas destacadas
          </h2>
        }
      >
        {featured.map((product, index) => (
          <TemplateCard
            key={product.id}
            product={product}
            analyticsItem={analyticsItems[index]}
          />
        ))}
      </TemplateCarousel>

      <Link
        href="/todos-los-documentos"
        className="text-ink border-ink mt-6 ml-(--inset-x) inline-flex items-center gap-2 border-b pb-1 text-lg font-normal transition-opacity hover:opacity-70"
      >
        Ver Todos los Documentos <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
};
