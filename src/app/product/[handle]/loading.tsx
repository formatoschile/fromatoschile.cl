import { ProductPageSkeleton } from "./_components/ProductPageSkeleton";

/** Shown instantly on navigation while the product's data streams in. */
const Loading: React.FC = () => {
  return <ProductPageSkeleton />;
};

export default Loading;
