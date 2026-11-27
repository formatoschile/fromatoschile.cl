import { ProductLink } from "@/components/Analytics/ProductLink";
import {
  CategoryPill,
  getCategoryStyle,
} from "@/components/ui/CategoryPill/CategoryPill";
import { LOCATIONS } from "@/lib/analytics";
import type { AnalyticsItem } from "@/lib/analytics";
import type { ProductCard } from "@/lib/shopify/types";
import { classNames } from "@/lib/utils/classNames";
import { getProductCardDisplay } from "@/lib/utils/product";

import { DocumentThumbnail } from "./DocumentThumbnail";

interface DocumentCardProps {
  product: ProductCard;
  analyticsItem: AnalyticsItem;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  product,
  analyticsItem,
}) => {
  const { category, price } = getProductCardDisplay(product);

  return (
    <ProductLink
      handle={product.handle}
      item={analyticsItem}
      location={LOCATIONS.card}
      className="block overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-neutral-100 transition-shadow hover:shadow-md"
    >
      <div
        className={classNames("h-2.5 w-full", getCategoryStyle(category).bar)}
      />

      <div className="p-4">
        <div className="flex justify-end">
          <CategoryPill category={category} />
        </div>

        <DocumentThumbnail image={product.featuredImage} />

        <h3 className="text-ink mt-4 min-h-[3rem] text-base leading-snug">
          {product.title}
        </h3>

        <p className="text-ink mt-2 text-xl">{price}</p>
      </div>
    </ProductLink>
  );
};
