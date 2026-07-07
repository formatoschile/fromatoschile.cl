import { ButtonHTMLAttributes } from "react";

import { classNames } from "@/lib/classNames";

import { LoadingDots } from "./LoadingDots";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: "primary" | "accent";
  className?: string;
  pending?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = "primary",
  className,
  pending,
}) => {
  return (
    <button
      disabled={pending}
      className={classNames(
        "cursor-pointer inline-block rounded-full px-6 py-2 text-white transition-all hover:scale-105 hover:brightness-110",
        {
          "bg-brand-primary": variant === "primary",
          "bg-accent": variant === "accent",
        },
        className
      )}
    >
      {pending ? <LoadingDots className="bg-white" /> : label}
    </button>
  );
};
