import React from "react";

import { classNames } from "@/lib/utils/classNames";

interface GridItemProps extends React.ComponentProps<"li"> {}

export const GridItem: React.FC<GridItemProps> = ({ children, ...props }) => {
  return (
    <li
      {...props}
      className={classNames(
        "aspect-square transition-opacity",
        props.className
      )}
    >
      {children}
    </li>
  );
};
