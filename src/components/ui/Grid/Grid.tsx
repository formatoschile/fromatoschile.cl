import React from "react";

import { classNames } from "@/lib/utils/classNames";

export const Grid: React.FC<React.ComponentProps<"ul">> & {
  Item: React.FC<React.ComponentProps<"li">>;
} = ({ children, ...props }) => {
  return (
    <ul
      {...props}
      className={classNames("grid grid-flow-row gap-4", props.className)}
    >
      {children}
    </ul>
  );
};

export const GridItem: React.FC<React.ComponentProps<"li">> = ({
  children,
  ...props
}) => {
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

Grid.Item = GridItem;
