import { mapTwFontClass } from "@lib/styles";
import {
  type FontWeight,
  type TypographyStyle,
  type MappedTwProperties,
  mappedTwProperties,
} from "@lib/styles/typography";

type TextProps = {
  /**
   * Allows you to specify this component's HTML element
   *
   * - - -
   *
   * Default: `p`
   */
  asElement?: "h1" | "h2" | "h3" | "h4" | "p" | "span";

  /** A space-delimited list of class names to pass along to a child element. */
  className?: string;

  /** Which typography style should the text use? */
  style?: TypographyStyle;

  /**
   * The font size of the text according to our pre-defined css variables.
   *
   * __Heading__
   * - `H1 24px` | `H2 16px`
   *
   * __Body__
   * - `body-small 12px`
   *
   * __Small__
   * - `Small 10px`
   *
   * - - -
   *
   * Default: `base (16px)`
   */
  fontSize?: string;

  /**
   * Sets how thick or thin characters in text should be displayed.
   * This will override any of typography style presets
   *
   * - - -
   *
   * Default: `regular`
   */
  fontWeight?: FontWeight;

  /**
   * Specifies the height of a line of text using Tailwind CSS values
   *
   * - `tight 125%` | `normal 150%`
   *
   * - - -
   *
   * Default: `normal (150%)`
   */
  lineHeight?: string;

  /**
   * Specifies the color of text using to Tailwind CSS colors.
   *
   * - - -
   *
   * Default: `slate-900`
   */
  color?: string;

  /**
   * Specifies letter spacing using Tailwind CSS values.
   *
   * - `tighter -0.05em` | `tight -0.025em%`
   *
   * - - -
   *
   * Default: `normal`
   */
  letterSpacing?: string;
};

export const Text: React.FC<React.PropsWithChildren<TextProps>> = ({
  asElement = "p",
  style,
  className,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  color,
  children,
}) => {
  const HtmlElement = asElement;
  console.log(HtmlElement);

  const propertyValues: Record<MappedTwProperties, string | undefined> = {
    fontWeight,
    fontSize,
    lineHeight,
    letterSpacing,
    color,
  };

  const fontStyleClasses = mappedTwProperties
    .map((property) =>
      mapTwFontClass(property, { style, propValue: propertyValues[property] }),
    )
    .join(" ");

  return (
    <HtmlElement
      className={`${fontStyleClasses}${className ? ` ${className}` : ""}`}
    >
      {children}
    </HtmlElement>
  );
};
