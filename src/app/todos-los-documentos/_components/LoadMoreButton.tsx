interface LoadMoreButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  isLoading,
  onClick,
}) => {
  return (
    <div className="mt-10 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className="border-ink text-ink hover:bg-ink cursor-pointer rounded-full border px-6 py-3 text-sm tracking-wide transition-colors hover:text-white disabled:cursor-wait disabled:opacity-60"
      >
        {isLoading ? "Cargando…" : "Cargar más"}
      </button>
    </div>
  );
};
