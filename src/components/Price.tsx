import React from "react";
import clsx from "clsx";

interface PriceProps extends React.ComponentProps<"p"> {
  amount: string;
  className?: string;
  currencyCode: string;
  currencyCodeClassName?: string;
}

export const Price: React.FC<PriceProps> = ({
  amount,
  className,
  currencyCode = "CLP",
  currencyCodeClassName,
  ...props
}) => (
  <p suppressHydrationWarning={true} className={className} {...props}>
    {`${formatPrice(amount, currencyCode)}`}
    <span
      className={clsx("ml-1 inline", currencyCodeClassName)}
    >{`${currencyCode}`}</span>
  </p>
);

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
  }).format(parseFloat(amount));
}
