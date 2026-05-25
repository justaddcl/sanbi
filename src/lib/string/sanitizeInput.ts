import validator from "validator";

const dangerousElementPattern =
  /<(script|style|iframe|object|embed|svg|math)\b[^>]*>[\s\S]*?<\/\1>/gi;
const unclosedDangerousElementPattern =
  /<(script|style|iframe|object|embed|svg|math)\b[\s\S]*$/gi;
const dangerousVoidElementPattern =
  /<(img|link|meta|base|input|frame|area|param|source|track|wbr)\b[^>]*\/?>/gi;
const unclosedDangerousVoidElementPattern =
  /<(img|link|meta|base|input|frame|area|param|source|track|wbr)\b[\s\S]*$/gi;
const htmlTagPattern = /<\/?[a-zA-Z][a-zA-Z0-9:-]*(?:\s[^<>]*)?>/g;
const rawAmpersandPattern = /&(?!(?:[a-zA-Z][a-zA-Z0-9]+|#\d+|#x[\da-fA-F]+);)/g;

export const sanitizeInput = (input: string): string => {
  const textOnly = input
    .replace(dangerousElementPattern, "")
    .replace(unclosedDangerousElementPattern, "")
    .replace(dangerousVoidElementPattern, "")
    .replace(unclosedDangerousVoidElementPattern, "")
    .replace(htmlTagPattern, "");

  const normalizedText = textOnly
    .replace(rawAmpersandPattern, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return validator.escape(normalizedText);
};
