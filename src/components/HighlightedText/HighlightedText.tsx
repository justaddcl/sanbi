import { escapeRegExp } from "@lib/string/escapeRegExp";

type HighlightedTextProps = {
  highlightWhenNoExactMatch?: boolean;
  query: string;
  text: string;
};

const FUZZY_HIGHLIGHT_MINIMUM_SCORE = 0.65;

const normalizeMatchCandidate = (value: string) =>
  value.replace(/[^\p{L}\p{N}]+/gu, "").toLowerCase();

const getEditDistance = (leftValue: string, rightValue: string) => {
  const previousDistances = Array.from(
    { length: rightValue.length + 1 },
    (_, index) => index,
  );

  for (let leftIndex = 0; leftIndex < leftValue.length; leftIndex += 1) {
    const currentDistances = [leftIndex + 1];

    for (let rightIndex = 0; rightIndex < rightValue.length; rightIndex += 1) {
      const substitutionCost =
        leftValue[leftIndex] === rightValue[rightIndex] ? 0 : 1;

      currentDistances[rightIndex + 1] = Math.min(
        (currentDistances[rightIndex] ?? Number.POSITIVE_INFINITY) + 1,
        (previousDistances[rightIndex + 1] ?? Number.POSITIVE_INFINITY) + 1,
        (previousDistances[rightIndex] ?? Number.POSITIVE_INFINITY) +
          substitutionCost,
      );
    }

    previousDistances.splice(0, previousDistances.length, ...currentDistances);
  }

  return previousDistances[rightValue.length] ?? 0;
};

const getSimilarityScore = (leftValue: string, rightValue: string) => {
  const longestLength = Math.max(leftValue.length, rightValue.length);

  if (longestLength === 0) {
    return 0;
  }

  return 1 - getEditDistance(leftValue, rightValue) / longestLength;
};

const getBestFuzzyMatchSegmentIndex = (segments: string[], query: string) => {
  let bestMatchIndex = -1;
  let bestMatchScore = 0;

  segments.forEach((segment, index) => {
    const normalizedSegment = normalizeMatchCandidate(segment);

    if (!normalizedSegment) {
      return;
    }

    const score = getSimilarityScore(normalizedSegment, query);

    if (score > bestMatchScore) {
      bestMatchIndex = index;
      bestMatchScore = score;
    }
  });

  return bestMatchScore >= FUZZY_HIGHLIGHT_MINIMUM_SCORE ? bestMatchIndex : -1;
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
    const fuzzySegments = text.split(/(\s+)/);
    const fuzzyMatchSegmentIndex = getBestFuzzyMatchSegmentIndex(
      fuzzySegments,
      normalizedQuery.toLowerCase(),
    );

    if (fuzzyMatchSegmentIndex === -1) {
      return text;
    }

    return (
      <>
        {fuzzySegments.map((segment, index) =>
          index === fuzzyMatchSegmentIndex ? (
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
