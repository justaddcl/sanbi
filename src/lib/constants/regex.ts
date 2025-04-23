/**
 * Song name regex pattern
 * Allows:
 *  - a-z
 *  - A-Z
 *  - 0-9
 *  - spaces
 *  - the following symbols: : / ( ) ' " - _ . ! ? &
 */
export const songNameRegex = /^[A-Za-z0-9\s:\/\(\)'"\-_.!?&]+$/;

/**
 * Tag name regex pattern
 * Allows:
 *  - any letter from any language
 *  - any kind of numeric digit
 *  - the following symbols: _ - '
 *  - spaces
 *  - must contain at least one non-whitespace character (no whitespace-only tags)
 *  - emojis
 */
export const tagRegex =
  /^(?=.*\S)[\p{L}\p{N}_'\-\p{Extended_Pictographic} ]+$/u;
