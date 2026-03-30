import Image from "next/image";
import Link from "next/link";

import { Price } from "@/components/Price";
import { DEFAULT_OPTION } from "@/lib/constants";
import { CartItem as CartItemType } from "@/lib/shopify/types";
import { createUrl } from "@/lib/utils";

import { useCart } from "../CartContext";

import { DeleteItemButton } from "./DeleteItemButton";
import { EditItemQuantityButton } from "./EditItemQuantityButton";

type MerchandiseSearchParams = {
  [key: string]: string;
};

interface CartItemProps {
  item: CartItemType;
  closeCart: () => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, closeCart }) => {
  const { updateCartItem } = useCart();
  const merchandiseSearchParams = {} as MerchandiseSearchParams;

  item.merchandise.selectedOptions.forEach(({ name, value }) => {
    if (value !== DEFAULT_OPTION) {
      merchandiseSearchParams[name.toLowerCase()] = value;
    }
  });

  const merchandiseUrl = createUrl(
    `/product/${item.merchandise.product.handle}`,
    new URLSearchParams(merchandiseSearchParams)
  );

  return (
    <li className="flex w-full flex-col border-b border-accent">
      <div className="relative flex w-full flex-row justify-between px-1 py-4">
        <div className="absolute z-40 -ml-1 -mt-2">
          <DeleteItemButton item={item} optimisticUpdate={updateCartItem} />
        </div>
        <div className="flex flex-row">
          <div className="relative h-16 w-16 overflow-hidden rounded-md border  bg-neutral-300 border-accent hover:bg-neutral-800">
            <Image
              className="h-full w-full object-cover"
              width={64}
              height={64}
              alt={
                item.merchandise.product.featuredImage.altText ||
                item.merchandise.product.title
              }
              src={item.merchandise.product.featuredImage.url}
            />
          </div>
          <Link
            href={merchandiseUrl}
            onClick={closeCart}
            className="z-30 ml-2 flex flex-row space-x-4"
          >
            <div className="flex flex-1 flex-col text-base">
              <span className="leading-tight">
                {item.merchandise.product.title}
              </span>
              {item.merchandise.title !== DEFAULT_OPTION ? (
                <p className="text-sm text-neutral-400">
                  {item.merchandise.title}
                </p>
              ) : null}
              <CartItemAttributes attributes={item.attributes} />
            </div>
          </Link>
        </div>
        <div className="flex h-16 flex-col justify-between">
          <Price
            className="flex justify-end space-y-2 text-right text-sm"
            amount={item.cost.totalAmount.amount}
            currencyCode={item.cost.totalAmount.currencyCode}
          />
          <div className="ml-auto flex h-9 flex-row items-center rounded-full border  border-accent">
            <EditItemQuantityButton
              item={item}
              type="minus"
              optimisticUpdate={updateCartItem}
            />
            <p className="w-6 text-center">
              <span className="w-full text-sm">{item.quantity}</span>
            </p>
            <EditItemQuantityButton
              item={item}
              type="plus"
              optimisticUpdate={updateCartItem}
            />
          </div>
        </div>
      </div>
    </li>
  );
};

interface CartItemAttributesProps {
  attributes: { key: string; value: string }[];
}

const CartItemAttributes: React.FC<CartItemAttributesProps> = ({
  attributes,
}) => {
  // Filter out internal keys (prefixed with _)
  const displayAttributes = attributes.filter(
    (attr) => !attr.key.startsWith("_")
  );

  if (displayAttributes.length === 0) return null;

  return (
    <div className="mt-1 space-y-0.5">
      {displayAttributes.map((attr) => (
        <p key={attr.key} className="text-xs text-neutral-400">
          <span className="font-medium">{attr.key}:</span> {attr.value}
        </p>
      ))}
    </div>
  );
};
