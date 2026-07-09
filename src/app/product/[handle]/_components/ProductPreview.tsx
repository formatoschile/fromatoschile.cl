import type { ProductPreviewPdf } from "@/lib/shopify/types";

interface ProductPreviewProps {
  previewPdf: ProductPreviewPdf;
}

/**
 * Renders the watermarked preview PDF (Shopify `custom.previewPdf` file metafield)
 * using the browser's native PDF viewer. Falls back to a plain link on browsers
 * that can't embed PDFs (some mobile browsers). Renders nothing when no preview
 * is assigned to the product.
 */
export const ProductPreview: React.FC<ProductPreviewProps> = ({
  previewPdf,
}) => {
  const url = previewPdf?.reference?.url;

  if (!url) return null;

  return (
    <object
      data={url}
      type="application/pdf"
      aria-label="Vista previa del documento"
      className="mt-4 h-[600px] w-full rounded-lg border border-neutral-200"
    >
      <a href={url} className="text-blue-600 underline">
        Ver vista previa (PDF)
      </a>
    </object>
  );
};
