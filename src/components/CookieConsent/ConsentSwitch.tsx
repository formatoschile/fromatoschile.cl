"use client";

import { classNames } from "@/lib/utils/classNames";

interface ConsentSwitchProps {
  label: string;
  /** Id of the element describing the category, for screen readers. */
  descriptionId?: string;
  /** Passed back to `onToggle`, so callers need no per-row closure. */
  name?: string;
  isChecked: boolean;
  isDisabled?: boolean;
  onToggle?: (name: string) => void;
}

/** An accessible on/off switch for one cookie category. */
export const ConsentSwitch: React.FC<ConsentSwitchProps> = ({
  label,
  descriptionId,
  name = "",
  isChecked,
  isDisabled = false,
  onToggle,
}) => {
  const handleClick = () => {
    onToggle?.(name);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      aria-label={label}
      aria-describedby={descriptionId}
      disabled={isDisabled}
      onClick={handleClick}
      className={classNames(
        "focus-visible:ring-ink relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        {
          "bg-brand-ink": isChecked,
          "bg-neutral-300": !isChecked,
          "cursor-not-allowed opacity-60": isDisabled,
          "cursor-pointer": !isDisabled,
        }
      )}
    >
      <span
        className={classNames(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-[left] duration-200",
          { "left-[22px]": isChecked, "left-0.5": !isChecked }
        )}
      />
    </button>
  );
};
