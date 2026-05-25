import DOMPurify from "isomorphic-dompurify";

export const stripHtmlMarkup = (input: string): string =>
  DOMPurify.sanitize(input, {
    ALLOWED_ATTR: [],
    ALLOWED_TAGS: [],
  });
