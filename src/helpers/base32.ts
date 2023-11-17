import { v4 as uuidv4 } from 'uuid';

import { ColorMode, Point } from '@/types';

var BASE32_DECODE_CHAR = {
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

export function decodeBase32(base32: string) {
  let value = 0;
  base32.split('').forEach((char, i) => {
    if (Object.keys(BASE32_DECODE_CHAR).includes(char)) {
      const charValue =
        BASE32_DECODE_CHAR[char as keyof typeof BASE32_DECODE_CHAR];

      value += Math.pow(charValue, i + 1);
    } else {
      return 0;
    }
  });
  return value;
}

export function decodeSwatch(swatch: string) {
  return { point: decodeBase32(swatch) };
}

function decodeSign(char: string) {
  if (char === '0') return -1;
  return 1;
}

export function decodeGraphPoint(
  point: string,
  index: number,
  totalPoints: number,
  colorMode: ColorMode,
): Point {
  if (point.length === 8) {
    return {
      uuid: uuidv4(),
      colorMode: colorMode,
      position: {
        x: index + 1 === totalPoints ? 1024 : 0,
        y: decodeBase32(point.slice(0, 2)),
      },
      handles: [
        {
          relativePosition: {
            x: decodeBase32(point.slice(3, 5)) * decodeSign(point[2]),
            y: decodeBase32(point.slice(6, 8)) * decodeSign(point[5]),
          },
        },
      ],
    };
  } else {
    return {
      uuid: uuidv4(),
      colorMode: colorMode,
      position: {
        x: decodeBase32(point.slice(0, 2)),
        y: decodeBase32(point.slice(3, 5)),
      },
      handles: [
        {
          relativePosition: {
            x: decodeBase32(point.slice(7, 9)) * decodeSign(point[6]),
            y: decodeBase32(point.slice(10, 12)) * decodeSign(point[9]),
          },
        },
        {
          relativePosition: {
            x: decodeBase32(point.slice(13, 15)) * decodeSign(point[12]),
            y: decodeBase32(point.slice(15, 17)) * decodeSign(point[15]),
          },
        },
      ],
    };
  }
}
