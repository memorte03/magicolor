import { ColorMode } from '@/types';

export const BASE32_DECODE_CHAR = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
  I: 8,
  J: 9,
  K: 10,
  L: 11,
  M: 12,
  N: 13,
  O: 14,
  P: 15,
  Q: 16,
  R: 17,
  S: 18,
  T: 19,
  U: 20,
  V: 21,
  W: 22,
  X: 23,
  Y: 24,
  Z: 25,
  '2': 26,
  '3': 27,
  '4': 28,
  '5': 29,
  '6': 30,
  '7': 31,
} as const;

export const SIGN_DECODE_CHAR = {
  '0': -1,
  '1': 1,
} as const;

export type SignChar = keyof typeof SIGN_DECODE_CHAR;
export type SignValue = 1 | -1;

export const BASE32_ENCODE_CHAR = Object.fromEntries(
  Object.entries(BASE32_DECODE_CHAR).map(([key, value]) => [value, key]),
);

export const SIGN_ENCODE_CHAR = Object.fromEntries(
  Object.entries(SIGN_DECODE_CHAR).map(([key, value]) => [value, key]),
);

export const PATH_COLOR_MODE_SEGMENT_COUNT = 3 as const;
export const PATH_COLOR_MODE_ABBREVIATION: { [key in ColorMode]: string } = {
  hue: 'h',
  saturation: 's',
  light: 'l',
} as const;
export const PATH_SWATCHES_ABBREVIATION = 'p' as const;

export {
  decodeBase32Value,
  decodeGraphPoint,
  decodePaletteFromPath,
  decodeSwatch,
} from './decode';
export {
  encodeBase32Value,
  encodeGraphPoint,
  encodePathFromPalette,
  encodeSwatch,
} from './encode';
export { testBase32Path } from './testPath';
