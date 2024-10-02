import { mapTwFontClass } from "../mapTwFontClass";
import {
  type MappedTwProperties,
  TYPOGRAPHY_DEFAULTS,
  mappedTwProperties,
  textStyles,
  twClassNameMapping,
  typographyStyles,
  type FontWeight,
  type TypographyStyle,
} from "../typography";

describe("MapTwFontClass styles lib function", () => {
  describe.each(mappedTwProperties)(
    "should correctly map %s values",
    (propName) => {
      it(`with default params`, () => {
        const result = mapTwFontClass(propName);

        expect(result).toBe(
          `${twClassNameMapping[propName]}-${TYPOGRAPHY_DEFAULTS[propName]}`,
        );
      });

      it.each(typographyStyles)(`for %s style`, (style) => {
        const result = mapTwFontClass(propName, { style });

        expect(result).toBe(
          `${twClassNameMapping[propName]}-${textStyles[style][propName]}`,
        );
      });
    },
  );

  it(`should correctly map with a passed in prop value`, () => {
    const propName: MappedTwProperties = "fontWeight";
    const propValue: FontWeight = "semibold";

    const result = mapTwFontClass(propName, { propValue });

    expect(result).toBe(`${twClassNameMapping[propName]}-${propValue}`);
  });

  // TODO: fix this test since the color prop has been deprecated
  xit("should use the prop value over the pre-set style value", () => {
    // @ts-expect-error - the type error is expected as the color prop has been removed
    const propName: MappedTwProperties = "color";
    const style: TypographyStyle = "body-small";
    const propValue = "rose-900";

    const result = mapTwFontClass(propName, { style, propValue });

    expect(result).toBe(`${twClassNameMapping[propName]}-${propValue}`);
  });
});
