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
        "flex items-center justify-center rounded-full border border-ink/20 text-ink transition-colors hover:bg-white",
        className
      )}
    >
      {children}
    </button>
  );
};
