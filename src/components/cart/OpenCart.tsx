import React from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

import { classNames } from "@/lib/utils/classNames";

interface OpenCartProps {
  className?: string;
  quantity?: number;
}

export const OpenCart: React.FC<OpenCartProps> = ({ className, quantity }) => {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center text-brand-ink transition-colors hover:text-brand-ink/70">
      <ShoppingCartIcon className={classNames("h-5 w-5", className)} />

      {quantity ? (
        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-ink text-[10px] font-bold text-white">
          {quantity}
        </div>
      ) : null}
    </div>
  );
};
