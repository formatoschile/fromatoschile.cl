import { ProductPageSkeleton } from "./_components/ProductPageSkeleton";

/** Shown instantly on navigation while the product's data streams in. */
export default function Loading() {
  return <ProductPageSkeleton />;
}
