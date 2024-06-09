import {
  type TypographyStyle,
  type MappedTwProperties,
  twClassNameMapping,
  textStyles,
  TYPOGRAPHY_DEFAULTS,
} from "./typography";

export const mapTwFontClass = (
  propName: MappedTwProperties,
  options?: { style?: TypographyStyle; propValue?: string },
) => {
  const twPrefix = twClassNameMapping[propName];

  let styleValue: string = TYPOGRAPHY_DEFAULTS[propName];

  if (options?.style) {
    styleValue = textStyles[options.style][propName];
  }

  if (options?.propValue) {
    styleValue = options.propValue;
  }

  return `${twPrefix}-${styleValue}`;
};
