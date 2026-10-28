import { XMarkIcon } from "@heroicons/react/24/outline";

export const CloseCartButton: React.FC = () => {
  return (
    <div className="border-brand-ink/20 text-brand-ink relative flex h-11 w-11 items-center justify-center rounded-md border transition-colors">
      <XMarkIcon className="h-6 transition-all ease-in-out hover:scale-110" />
    </div>
  );
};
