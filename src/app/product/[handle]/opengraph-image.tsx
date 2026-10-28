import { createOpengraphImage } from "@/components/createOpengraphImage";
import { getProduct } from "@/lib/shopify";

export default async function Image({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProduct(handle);
  const title = product?.seo?.title || product?.title;

  return await createOpengraphImage({ title });
}
