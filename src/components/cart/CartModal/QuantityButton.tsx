"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

import { classNames } from "@/lib/utils/classNames";

interface QuantityButtonProps {
  type: "plus" | "minus";
  isPending: boolean;
  onClick: () => void;
}

export const QuantityButton: React.FC<QuantityButtonProps> = ({
  type,
  isPending,
  onClick,
}) => {
  return (
    <button
      type="button"
      disabled={isPending}
      aria-label={type === "plus" ? "Aumentar cantidad" : "Reducir cantidad"}
      className={classNames(
        "cursor-pointer ease flex h-full w-9 flex-none items-center justify-center rounded-full p-2 transition-all duration-200 hover:border-neutral-800 hover:opacity-80",
        {
          "ml-auto": type === "minus",
          "cursor-wait opacity-60": isPending,
        }
      )}
      onClick={onClick}
    >
      {type === "plus" ? (
        <PlusIcon className="h-4 w-4" />
      ) : (
        <MinusIcon className="h-4 w-4" />
      )}
    </button>
  );
};
