import { BuyButton } from "@/components/cart/BuyButton";
import { CategoryPill } from "@/components/ui/CategoryPill/CategoryPill";

import type { DocItem } from "./types";

interface FeaturedCardProps {
  doc: DocItem;
  onSelect: () => void;
}

export const FeaturedCard: React.FC<FeaturedCardProps> = ({
  doc,
  onSelect,
}) => {
  return (
    <div className="relative flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-100 transition-shadow hover:shadow-md">
      {/* Full-card click target: opens the preview modal. */}
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Ver ${doc.title}`}
        className="absolute inset-0 z-0 cursor-pointer rounded-2xl"
      />

      <div className="pointer-events-none relative z-10 flex flex-1 flex-col text-left">
        <h3 className="text-xl leading-snug text-neutral-800">{doc.title}</h3>

        <CategoryPill category={doc.category} className="mt-4 self-start" />

        <ul className="mt-6 list-disc space-y-2 pl-4 text-sm text-neutral-600">
          {doc.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>

        <div className="mt-auto flex items-center justify-between pt-8">
          <span className="text-2xl text-neutral-800">{doc.price}</span>
          <BuyButton
            variantId={doc.variantId}
            className="pointer-events-auto rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
          />
        </div>
      </div>
    </div>
  );
};
