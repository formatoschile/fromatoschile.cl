import { classNames } from "@/lib/utils/classNames";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
}

/** Round bordered icon button (carousel arrows, pagers). Size via className. */
export const IconButton: React.FC<IconButtonProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <button
      type="button"
      {...props}
      className={classNames(
        "flex items-center justify-center rounded-full border border-neutral-400 text-neutral-700 transition-colors hover:bg-white",
        className
      )}
    >
      {children}
    </button>
  );
};
