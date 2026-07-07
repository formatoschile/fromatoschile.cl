import Image from "next/image";
import Link from "next/link";

import { Collection, Image as ShopifyImage } from "@/lib/shopify/types";

interface CollectionCardProps {
  collection: Collection;
  image?: ShopifyImage;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  image,
}) => (
  <Link
    href={collection.path as "/todos-los-documentos"}
    className="z-10 group shrink-0 transition-transform duration-300"
  >
    <div className="relative w-[230px] overflow-hidden shadow-xl md:w-[280px]">
      {image ? (
        <Image
          src={image.url}
          alt={image.altText || collection.title}
          width={image.width}
          height={image.height}
          className="w-full h-auto transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 230px, 280px"
        />
      ) : (
        <div className="flex aspect-3/4 w-full items-center justify-center bg-linear-to-br from-brand-secondary via-brand-secondary/80 to-primary/20">
          <span className="text-6xl">✨</span>
        </div>
      )}

      <div className="absolute p-3 inset-x-0 flex items-end bottom-0 h-32 bg-linear-to-t from-black/70 via-black/30 to-transparent">
        <h3 className="mt-4 text-lg text-white md:text-xl">
          {collection.title}
        </h3>
      </div>
    </div>
  </Link>
);
