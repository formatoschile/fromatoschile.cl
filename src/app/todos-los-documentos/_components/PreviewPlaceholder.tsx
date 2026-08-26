import { classNames } from "@/lib/utils/classNames";

/**
 * Faux-document placeholder shown while a product has no watermarked
 * preview asset yet.
 */

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
