interface JsonLdProps {
  data: object;
}

export const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      /* oxlint-disable-next-line react/no-danger -- JSON-LD from app data */
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};
