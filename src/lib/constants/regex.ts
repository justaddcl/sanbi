/**
 * Song name regex pattern
 * Allows:
 *  - a-z
 *  - A-Z
 *  - 0-9
 *  - spaces
 *  - the following symbols: : / ( ) ' " - _ . ? ? &
 */
export const songNameRegex = /^[A-Za-z0-9\s:\/\(\)'"\-_.!?&]+$/;

/**
 * Tag name regex pattern
 * Allows:
 *  - any letter from any language
 *  - any kind of numeric digit
 *  - the following symbols: _ - '
 *  - spaces
 *  - emojis
 *  Total length: 1-30
 */
export const tagRegex = /^[\p{L}\p{N}_'\-\p{Extended_Pictographic} ]+$/u;
