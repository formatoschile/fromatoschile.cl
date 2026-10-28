interface CartItemAttributesProps {
  attributes: { key: string; value: string }[];
}

export const CartItemAttributes: React.FC<CartItemAttributesProps> = ({
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
        <p key={attr.key} className="text-brand-ink/60 text-xs">
          <span className="font-medium">{attr.key}:</span> {attr.value}
        </p>
      ))}
    </div>
  );
};
