import { getTransposeSemitoneDistance } from "./getTransposeSemitoneDistance";
import { isSupportedSongKey } from "./isSupportedSongKey";
import { parseChordToken } from "./parseChordToken";
import { transposeChordRoot } from "./transposeChordRoot";
import {
  type ChordTokenTranspositionResult,
  type ChordTokenTranspositionReviewReason,
  type ParsedChordToken,
} from "./types";

const createUnchangedResult = ({
  token,
  status,
}: {
  token: string;
  status: ChordTokenTranspositionResult["status"];
}): ChordTokenTranspositionResult => ({
  originalToken: token,
  transposedToken: token,
  wasTransposed: false,
  status,
  requiresReview: false,
  reviewReasons: [],
});

const tokenPartStartsWithLowercaseRoot = (tokenPart: string): boolean =>
  /^[a-g]/.test(tokenPart);

const getReviewReasons = (
  parsedChordToken: ParsedChordToken,
): ChordTokenTranspositionReviewReason[] => {
  const reviewReasons = new Set<ChordTokenTranspositionReviewReason>();
  const [chordPart, bassPart] = parsedChordToken.token.split("/");

  if (
    (chordPart && tokenPartStartsWithLowercaseRoot(chordPart)) ||
    (bassPart && tokenPartStartsWithLowercaseRoot(bassPart))
  ) {
    reviewReasons.add("lowercase-root");
  }

  if (parsedChordToken.suffix === "" && !parsedChordToken.bass) {
    reviewReasons.add("bare-root");
  }

  return [...reviewReasons];
};

export const transposeChordToken = ({
  token,
  sourceKey,
  targetKey,
}: {
  token: string;
  sourceKey: string;
  targetKey: string;
}): ChordTokenTranspositionResult => {
  if (!isSupportedSongKey(sourceKey) || !isSupportedSongKey(targetKey)) {
    return createUnchangedResult({ token, status: "unsupported-key" });
  }

  const parsedChordToken = parseChordToken(token);

  if (!parsedChordToken) {
    return createUnchangedResult({ token, status: "unsupported-token" });
  }

  const semitoneDistance = getTransposeSemitoneDistance({
    sourceKey,
    targetKey,
  });
  const transposedRoot = transposeChordRoot({
    root: parsedChordToken.root,
    semitoneDistance,
    targetKey,
  });

  const transposedToken = parsedChordToken.bass
    ? `${transposedRoot}${parsedChordToken.suffix}/${transposeChordRoot({
        root: parsedChordToken.bass.root,
        semitoneDistance,
        targetKey,
      })}${parsedChordToken.bass.suffix}`
    : `${transposedRoot}${parsedChordToken.suffix}`;
  const reviewReasons = getReviewReasons(parsedChordToken);

  return {
    originalToken: token,
    transposedToken,
    wasTransposed: semitoneDistance !== 0 && transposedToken !== token,
    status: "transposed",
    requiresReview: reviewReasons.length > 0,
    reviewReasons,
  };
};
