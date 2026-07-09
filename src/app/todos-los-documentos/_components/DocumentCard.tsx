import {
  CategoryPill,
  getCategoryStyle,
} from "@/components/ui/CategoryPill/CategoryPill";
import { classNames } from "@/lib/utils/classNames";

import { PreviewThumbnail } from "./PreviewPlaceholder";
import type { DocItem } from "./types";

interface DocumentCardProps {
  doc: DocItem;
  onSelect: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  onSelect,
}) => {
  const { title, category } = doc;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="cursor-pointer overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-neutral-100 transition-shadow hover:shadow-md"
    >
      <div
        className={classNames("h-2.5 w-full", getCategoryStyle(category).bar)}
      />

      <div className="p-4">
        <div className="flex justify-end">
          <CategoryPill category={category} />
        </div>

        <PreviewThumbnail />

        <h3 className="mt-4 min-h-[3rem] text-base leading-snug text-neutral-800">
          {title}
        </h3>

        <p className="mt-2 text-xl text-neutral-800">{doc.price}</p>
      </div>
    </button>
  );
};
