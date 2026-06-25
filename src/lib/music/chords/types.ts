export type ChordAccidental = "#" | "b";
export type ChordRootLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type ChordRoot = ChordRootLetter | `${ChordRootLetter}${ChordAccidental}`;

export type ParsedChordBass = {
  root: ChordRoot;
  suffix: string;
};

export type ParsedChordToken = {
  token: string;
  root: ChordRoot;
  suffix: string;
  bass: ParsedChordBass | null;
};

export type ChordTokenTranspositionReviewReason =
  | "bare-root"
  | "lowercase-root";

export type ChordTokenTranspositionStatus =
  | "transposed"
  | "unsupported-key"
  | "unsupported-token";

export type ChordTokenTranspositionResult = {
  originalToken: string;
  transposedToken: string;
  wasTransposed: boolean;
  status: ChordTokenTranspositionStatus;
  requiresReview: boolean;
  reviewReasons: ChordTokenTranspositionReviewReason[];
};
