import { Route } from "next";
import Link, { type LinkProps } from "next/link";

import { classNames } from "@/lib/classNames";

interface ButtonLinkProps extends LinkProps<Route> {
  href: Route;
  label: string;
  className?: string;
}

export const ButtonLink: React.FC<ButtonLinkProps> = ({
  href,
  label,
  className,
  ...props
}) => {
  return (
    <Link
      {...props}
      href={href}
      className={classNames(
        "inline-block rounded-full bg-brand-primary px-6 py-2 text-white transition-all hover:scale-105 hover:brightness-110",
        className
      )}
    >
      {label}
    </Link>
  );
};
