"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/Button/Button";

interface CheckoutButtonProps {
  isRedirecting: boolean;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  isRedirecting,
}) => {
  const { pending: isPending } = useFormStatus();

  return (
    <Button
      className="w-full"
      type="submit"
      variant="ink"
      isPending={isPending || isRedirecting}
    >
      Continuar con el pago
    </Button>
  );
};
