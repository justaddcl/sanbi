import { getHighlightedTextSegments } from "@lib/string/getHighlightedTextSegments";

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
  const segments = getHighlightedTextSegments({
    enableFuzzyFallback: highlightWhenNoExactMatch,
    query,
    text,
  });

  return (
    <>
      {segments.map((segment, index) =>
        segment.shouldHighlight ? (
          <mark
            key={`${segment.text}-${index}`}
            className="bg-transparent px-0 font-semibold text-slate-900"
          >
            {segment.text}
          </mark>
        ) : (
          <span key={`${segment.text}-${index}`}>{segment.text}</span>
        ),
      )}
    </>
  );
};
