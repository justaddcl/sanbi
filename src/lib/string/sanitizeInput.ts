import validator from "validator";

import { stripHtmlMarkup } from "./stripHtmlMarkup";

export const sanitizeInput = (input: string): string =>
  validator.escape(stripHtmlMarkup(input));
