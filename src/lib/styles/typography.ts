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
    fontSize: "2xl" /* 24px */,
    lineHeight: "normal" /* 150% / 30px */,
    fontWeight: "semibold",
    letterSpacing: "normal",
  },
  "header-medium": {
    fontSize: "base" /* 16px */,
    lineHeight: "normal" /* 150% / 24px */,
    fontWeight: "normal",
    letterSpacing: "normal",
  },
  "header-medium-semibold": {
    fontSize: "base" /* 16px */,
    lineHeight: "tight" /* 125% / 20px */,
    fontWeight: "semibold",
    letterSpacing: "normal",
  },
  "header-small": {
    fontSize: "xs" /* 12px */,
    lineHeight: "tight" /* 125% / 15px */,
    fontWeight: "normal",
    letterSpacing: "normal",
  },
  "header-small-semibold": {
    fontSize: "xs" /* 12px */,
    lineHeight: "tight" /* 125% / 15px*/,
    fontWeight: "semibold",
    letterSpacing: "tighter" /* -0.05em */,
  },
  "body-small": {
    fontSize: "xs" /* 12px */,
    lineHeight: "normal" /* 150% / 18px */,
    fontWeight: "normal",
    letterSpacing: "normal",
  },
  small: {
    fontSize:
      "[10px]" /* 10px doesn't exists as a preset font-size in Tailwind */,
    lineHeight: "normal" /* 150% / 15px */,
    fontWeight: "normal",
    letterSpacing: "normal",
  },
  "small-semibold": {
    fontSize:
      "[10px]" /* 10px doesn't exists as a preset font-size in Tailwind */,
    lineHeight: "normal" /* 150% / 15px */,
    fontWeight: "semibold",
    letterSpacing: "tight" /* -0.025em */,
  },
};
