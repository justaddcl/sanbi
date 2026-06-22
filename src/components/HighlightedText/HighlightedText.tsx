const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

type HighlightedTextProps = {
  highlightWhenNoExactMatch?: boolean;
  query: string;
  text: string;
};

export const HighlightedText = ({
  highlightWhenNoExactMatch = false,
  query,
  text,
}: HighlightedTextProps) => {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return text;
  }

  const segments = text.split(
    new RegExp(`(${escapeRegExp(normalizedQuery)})`, "gi"),
  );
  const hasExactMatch = segments.some(
    (segment) => segment.toLowerCase() === normalizedQuery.toLowerCase(),
  );

  if (!hasExactMatch && highlightWhenNoExactMatch) {
    return (
      <mark className="bg-transparent px-0 font-semibold text-slate-900">
        {text}
      </mark>
    );
  }

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
