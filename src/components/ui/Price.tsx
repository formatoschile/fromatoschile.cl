import React from "react";

import { formatPrice } from "@/lib/utils/money";

interface PriceProps extends React.ComponentProps<"p"> {
  amount: string;
  currencyCode: string;
}

export const Price: React.FC<PriceProps> = ({
  amount,
  currencyCode,
  ...props
}) => <p {...props}>{formatPrice({ amount, currencyCode })}</p>;
