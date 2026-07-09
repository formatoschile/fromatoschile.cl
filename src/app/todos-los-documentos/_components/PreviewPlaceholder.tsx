import { classNames } from "@/lib/utils/classNames";

/**
 * Faux-document placeholders shown while products have no watermarked
 * preview asset yet. `PreviewThumbnail` is the small card version;
 * `PreviewPage` is the full A4 page used in the modal.
 */

const PAGE_LINE_WIDTHS = [
  "w-full",
  "w-11/12",
  "w-full",
  "w-10/12",
  "w-full",
  "w-9/12",
  "w-11/12",
  "w-8/12",
];

const THUMBNAIL_LINE_WIDTHS = [
  "w-11/12",
  "w-10/12",
  "w-full",
  "w-9/12",
  "w-11/12",
  "w-8/12",
];

interface PlaceholderLinesProps {
  widths: string[];
  className?: string;
}

const PlaceholderLines: React.FC<PlaceholderLinesProps> = ({
  widths,
  className,
}) => {
  return (
    <div className={className}>
      {widths.map((width, index) => (
        <div
          key={index}
          className={classNames("h-1 rounded bg-neutral-200", width)}
        />
      ))}
    </div>
  );
};

export const PreviewThumbnail = () => {
  return (
    <div className="mt-2 rounded-md border border-neutral-200 bg-white px-5 py-4">
      <div className="flex items-center justify-center gap-1">
        <span className="h-3 w-3 rounded-sm bg-neutral-300" />
        <span className="h-1.5 w-10 rounded bg-neutral-200" />
      </div>

      <div className="mx-auto mt-3 h-1.5 w-2/3 rounded bg-neutral-300" />

      <PlaceholderLines
        widths={THUMBNAIL_LINE_WIDTHS}
        className="mt-4 space-y-1.5"
      />
    </div>
  );
};

export const PreviewPage = () => {
  return (
    <div className="relative mx-auto aspect-[1/1.414] w-full max-w-md overflow-hidden rounded-sm bg-white px-10 py-8 shadow-md">
      {/* Watermark */}
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="-rotate-45 select-none text-4xl font-bold uppercase tracking-widest text-neutral-900/5">
          Vista previa
        </span>
      </span>

      {/* Letterhead */}
      <div className="flex items-center justify-end gap-2 text-neutral-400">
        <span className="font-serif text-lg leading-none">
          <span className="inline-block -scale-x-100">R</span>K
        </span>
        <span className="text-[7px] uppercase leading-tight">
          Retamales
          <br />
          Kowalski
          <br />
          Abogados
        </span>
      </div>

      <div className="mx-auto mt-6 h-1.5 w-3/4 rounded bg-neutral-300" />

      <PlaceholderLines widths={PAGE_LINE_WIDTHS} className="mt-6 space-y-2" />
      <PlaceholderLines
        widths={PAGE_LINE_WIDTHS.slice(0, 6)}
        className="mt-6 space-y-2"
      />
    </div>
  );
};
