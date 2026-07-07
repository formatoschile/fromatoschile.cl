import { getCollectionProducts, getCollections } from "@/lib/shopify";
import { Image as ShopifyImage } from "@/lib/shopify/types";

import { CollectionCard } from "./CollectionCard";

export const CollectionsRails = async () => {
  const collections = await getCollections();

  const filteredCollections = collections.filter((c) => c.handle !== "");
  if (filteredCollections.length === 0) {
    return null;
  }

  // Get images for each collection
  const collectionsWithImages = await Promise.all(
    filteredCollections.map(async (collection) => {
      let image: ShopifyImage | undefined = collection.image;

      if (!image) {
        try {
          const products = await getCollectionProducts({
            collection: collection.handle,
          });
          image = products[0]?.featuredImage;
        } catch {
          // Silently fail if products can't be fetched
        }
      }

      return { collection, image };
    })
  );

  return (
    <section className="relative z-10 -mb-24 overflow-visible bg-tertiary py-20">
      <div className="relative z-10 mt-24 md:mt-28 lg:mt-32">
        {collectionsWithImages.map(({ collection, image }) => (
          <CollectionCard
            key={collection.handle}
            collection={collection}
            image={image}
          />
        ))}
      </div>
    </section>
  );
};
