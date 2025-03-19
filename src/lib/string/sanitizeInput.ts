import DOMPurify from "dompurify";
import validator from "validator";

export const sanitizeInput = (input: string): string =>
  DOMPurify.sanitize(validator.escape(input));
