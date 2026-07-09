import React from "react";

import { formatPrice } from "@/lib/utils/money";

interface PriceProps extends React.ComponentProps<"p"> {
  amount: string;
  className?: string;
  currencyCode: string;
}

export const Price: React.FC<PriceProps> = ({
  amount,
  className,
  currencyCode,
  ...props
}) => (
  <p suppressHydrationWarning={true} className={className} {...props}>
    {formatPrice({ amount, currencyCode })}
  </p>
);
