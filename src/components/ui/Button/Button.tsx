import type { ButtonHTMLAttributes } from "react";

import { classNames } from "@/lib/utils/classNames";

import { LoadingDots } from "./LoadingDots";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "ink";
  isPending?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className,
  isPending,
  children,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={isPending || props.disabled}
      className={classNames(
        "cursor-pointer inline-block rounded-full px-6 py-2 text-white transition-all hover:scale-105 hover:brightness-110",
        {
          "bg-brand-primary": variant === "primary",
          "bg-accent": variant === "accent",
          "bg-brand-ink": variant === "ink",
        },
        className
      )}
    >
      {isPending ? <LoadingDots className="bg-white" /> : children}
    </button>
  );
};
