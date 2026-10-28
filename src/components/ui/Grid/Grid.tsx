import React from "react";

import { classNames } from "@/lib/utils/classNames";

interface GridProps extends React.ComponentProps<"ul"> {}

export const Grid: React.FC<GridProps> = ({ children, ...props }) => {
  return (
    <ul
      {...props}
      className={classNames("grid grid-flow-row gap-4", props.className)}
    >
      {children}
    </ul>
  );
};
