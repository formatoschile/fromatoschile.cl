import { classNames } from "@/lib/utils/classNames";

interface AddToCartButtonProps {
  availableForSale: boolean;
  isPending: boolean;
  selectedVariantId: string | undefined;
  onClick: () => void;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  availableForSale,
  isPending,
  selectedVariantId,
  onClick,
}) => {
  const buttonClasses =
    "w-full border border-ink bg-white py-4 text-sm font-medium tracking-widest text-ink uppercase transition-colors";
  const disabledClasses =
    "cursor-not-allowed opacity-60 hover:bg-white hover:text-ink";

  if (!selectedVariantId) {
    return (
      <button
        aria-label="Selecciona una opción"
        disabled
        className={classNames(buttonClasses, disabledClasses)}
      >
        Agregar al carrito
      </button>
    );
  }

  if (!availableForSale) {
    return (
      <button disabled className={classNames(buttonClasses, disabledClasses)}>
        No disponible
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label="Agregar al carrito"
      disabled={isPending}
      onClick={onClick}
      className={classNames(buttonClasses, {
        "cursor-pointer hover:bg-ink hover:text-white": !isPending,
        "cursor-wait opacity-60": isPending,
      })}
    >
      Agregar al carrito
    </button>
  );
};
