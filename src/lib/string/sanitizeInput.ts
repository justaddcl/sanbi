import DOMPurify from "dompurify";
import validator from "validator";

export const sanitizeInput = (input: string): string =>
  validator.escape(DOMPurify.sanitize(input));
