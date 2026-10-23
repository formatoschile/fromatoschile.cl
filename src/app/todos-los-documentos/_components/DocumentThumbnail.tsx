import { DocumentTextIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

import type { Image as ShopifyImage } from "@/lib/shopify/types";

/**
 * Top of the document's first page, from the product's featured image (the
 * preview thumbnail generated from its watermarked PDF). Falls back to a
 * static document icon while a product has no thumbnail yet.
 */

// Card widths in the catalog grids (1 → 2 → 4 columns).
const THUMBNAIL_SIZES =
  "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";

interface DocumentThumbnailProps {
  image: ShopifyImage | null;
}

export const DocumentThumbnail: React.FC<DocumentThumbnailProps> = ({
  image,
}) => {
  return (
    <div className="relative mt-2 aspect-[4/3] overflow-hidden rounded-md border border-neutral-200 bg-white">
      {image ? (
        <Image
          src={image.url}
          // Decorative: the card's title sits right below, in the same link.
          alt=""
          fill
          sizes={THUMBNAIL_SIZES}
          className="object-cover object-top"
        />
      ) : (
        <div className="bg-mist flex h-full items-center justify-center">
          <DocumentTextIcon
            aria-hidden="true"
            className="h-12 w-12 text-neutral-300"
          />
        </div>
      )}
    </div>
  );
};
