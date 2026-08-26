interface SearchInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <input
      type="search"
      value={value}
      onChange={onChange}
      placeholder="Buscar documentos..."
      aria-label="Buscar documentos"
      className="h-14 w-full rounded-full border border-neutral-200 bg-white px-6 text-sm text-neutral-700 shadow-sm outline-none placeholder:text-neutral-400 focus:border-neutral-400"
    />
  );
};
