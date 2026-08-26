interface JsonLdProps {
  data: object;
}

export const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  // Escape "<" so a value like "</script><script>..." (e.g. a Shopify
  // product title) can't break out of the script tag and inject markup.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      /* oxlint-disable-next-line react/no-danger -- JSON-LD from app data, escaped above */
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
};
