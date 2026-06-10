const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

type HighlightedTextProps = {
  query: string;
  text: string;
};

export const HighlightedText = ({ query, text }: HighlightedTextProps) => {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return text;
  }

  const segments = text.split(
    new RegExp(`(${escapeRegExp(normalizedQuery)})`, "gi"),
  );

  return (
    <>
      {segments.map((segment, index) =>
        segment.toLowerCase() === normalizedQuery.toLowerCase() ? (
          <mark
            key={`${segment}-${index}`}
            className="bg-transparent px-0 font-semibold text-slate-900"
          >
            {segment}
          </mark>
        ) : (
          <span key={`${segment}-${index}`}>{segment}</span>
        ),
      )}
    </>
  );
};
