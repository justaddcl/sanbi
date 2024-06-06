import { capitalize } from "@lib/string";

export const startCase = (str: string): string => {
  const wordMatcher = /([0-9]+|([A-Z][a-z]+)|[a-z]+|([A-Z]+)(?![a-z]))/g;

  const words = str.match(wordMatcher);

  return words ? words.map((word) => capitalize(word)).join(" ") : "";
};
