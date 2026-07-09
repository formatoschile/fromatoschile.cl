import React from "react";

import { classNames } from "@/lib/utils/classNames";

const dots = "mx-[1px] inline-block h-1 w-1 animate-blink rounded-md";

interface LoadingDotsProps {
  className: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ className }) => {
  return (
    <span className="mx-2 inline-flex items-center">
      <span className={classNames(dots, className)} />
      <span
        className={classNames(dots, "[animation-delay:200ms]", className)}
      />
      <span
        className={classNames(dots, "[animation-delay:400ms]", className)}
      />
    </span>
  );
};
