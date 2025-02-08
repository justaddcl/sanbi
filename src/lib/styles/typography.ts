export const typographyStyles = [
  "header-large",
  "header-medium",
  "header-medium-semibold",
  "header-small",
  "header-small-semibold",
  "body-small",
  "small",
  "small-semibold",
] as const;

export type TypographyStyle = (typeof typographyStyles)[number];

export type FontWeight = "normal" | "medium" | "semibold" | "bold";

export const mappedTwProperties = [
  "fontWeight",
  "fontSize",
  "lineHeight",
  "letterSpacing",
] as const;

export type MappedTwProperties = (typeof mappedTwProperties)[number];

export type FontStyles = Record<MappedTwProperties, string>;

export const TYPOGRAPHY_DEFAULTS: Record<MappedTwProperties, string> = {
  fontWeight: "normal",
  fontSize: "base" /* 16px */,
  lineHeight: "normal" /* 150% */,
  letterSpacing: "normal",
};

export const twClassNameMapping: Record<MappedTwProperties, string> = {
  fontWeight: "font",
  fontSize: "text",
  lineHeight: "leading",
  letterSpacing: "tracking",
};

export const textStyles: Record<TypographyStyle, FontStyles> = {
  "header-large": {
    fontSize: "4xl" /* 36px */,
    lineHeight: "tight" /* 1.25 */,
    fontWeight: "semibold",
    letterSpacing: "tighter" /* -0.05em */,
  },
  "header-medium": {
    fontSize: "lg" /* 18px */,
    lineHeight: "tight" /* 1.25 */,
    fontWeight: "normal",
    letterSpacing: "tight" /* -0.025em */,
  },
  "header-medium-semibold": {
    fontSize: "base" /* 16px */,
    lineHeight: "tight" /* 1.25% */,
    fontWeight: "semibold",
    letterSpacing: "normal",
  },
  "header-small": {
    fontSize: "sm" /* 14px */,
    lineHeight: "normal" /* 1.5 */,
    fontWeight: "normal",
    letterSpacing: "normal",
  },
  "header-small-semibold": {
    fontSize: "sm" /* 14px */,
    lineHeight: "tight" /* 1.25 */,
    fontWeight: "semibold",
    letterSpacing: "normal",
  },
  "body-small": {
    fontSize: "sm" /* 14px */,
    lineHeight: "normal" /* 1.5 */,
    fontWeight: "normal",
    letterSpacing: "normal",
  },
  small: {
    fontSize: "xs" /* 12px */,
    lineHeight: "normal" /* 150% / 15px */,
    fontWeight: "normal",
    letterSpacing: "normal",
  },
  "small-semibold": {
    fontSize: "xs" /* 12px */,
    lineHeight: "normal" /* 150% / 15px */,
    fontWeight: "semibold",
    letterSpacing: "tight" /* -0.025em */,
  },
};
