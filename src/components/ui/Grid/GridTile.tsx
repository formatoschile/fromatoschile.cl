import React from "react";
import Image from "next/image";

import { Label } from "@/components/ui/Label";
import { classNames } from "@/lib/utils/classNames";

interface GridTileImageProps extends React.ComponentProps<typeof Image> {
  isInteractive?: boolean;
  active?: boolean;
  label?: {
    title: string;
    amount: string;
    currencyCode: string;
    position?: "bottom" | "center";
  };
}

export const GridTileImage: React.FC<GridTileImageProps> = ({
  isInteractive = true,
  active,
  label,
  ...props
}) => {
  return (
    <div
      className={classNames(
        "group flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-white hover:border-blue-600",
        {
          relative: label,
          "border-2 border-blue-600": active,
          "border-neutral-200": !active,
        }
      )}
    >
      {props.src ? (
        <Image
          className={classNames("relative h-full w-full object-contain", {
            "transition duration-300 ease-in-out group-hover:scale-105":
              isInteractive,
          })}
          {...props}
        />
      ) : null}
      {label ? (
        <Label
          title={label.title}
          amount={label.amount}
          currencyCode={label.currencyCode}
          position={label.position}
        />
      ) : null}
    </div>
  );
};
