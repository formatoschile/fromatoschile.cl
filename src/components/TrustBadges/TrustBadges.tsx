import { classNames } from "@/lib/utils/classNames";

import { TRUST_BADGES } from "./constants";

interface TrustBadgesProps {
  className?: string;
}

/** 2×2 grid of icon badges (RGPD, abogados, SSL, ISO) shown near purchase CTAs. */
export const TrustBadges: React.FC<TrustBadgesProps> = ({ className }) => {
  return (
    <ul
      aria-label="Garantías"
      className={classNames("grid grid-cols-2 gap-3", className)}
    >
      {TRUST_BADGES.map(({ label, description, Icon }) => (
        <li
          key={label}
          className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3"
        >
          <span className="bg-primary text-brand-ink flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-ink text-sm leading-tight font-medium">
              {label}
            </span>
            <span className="text-xs leading-tight text-neutral-500">
              {description}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
};
