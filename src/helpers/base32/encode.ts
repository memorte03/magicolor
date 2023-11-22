import { COLOR_MODES } from '@/constants';
import { Palette, Point, Swatch } from '@/types';

import {
  BASE32_ENCODE_CHAR,
  PATH_COLOR_MODE_ABBREVIATION,
  PATH_SWATCHES_ABBREVIATION,
  SignChar,
} from '.';

/**
 * Encodes a numerical value into a base32 string.
 * @param value - The numerical value to encode (MUST BE IN THE RANGE 0-1024).
 * @returns The encoded base32 string.
 */
export function encodeBase32Value(value: number): string {
  if (value < 0) {
    throw new Error(
      'Negative values cannot be encoded in base32. Provide a positive sign value.',
    );
  }
  if (value > 1024) {
    throw new Error('Values over 1024 cannot be encoded in base32.');
  }

  if (value === 0) return BASE32_ENCODE_CHAR[0] + BASE32_ENCODE_CHAR[0];

  let base32 = '';
  while (value > 0) {
    const remainder = value % 32;
    base32 = BASE32_ENCODE_CHAR[remainder] + base32;
    value = Math.floor(value / 32);
  }

  return base32.padStart(2, BASE32_ENCODE_CHAR[0]);
}

/**
 * Encodes a Swatch object into a base32 string.
 * @param swatch - The Swatch object to encode.
 * @returns The encoded base32 string.
 */
export function encodeSwatch(swatch: Swatch): string {
  return encodeBase32Value(swatch.point);
}

/**
 * Encodes a Point object into a base32 string.
 * @param point - The Point object to encode.
 * @param index - Index of the given point.
 * @param totalPoints - total number of points in the color sub-path
 * @returns The encoded base32 string.
 */
export function encodeGraphPoint(
  point: Point,
  index: number,
  totalPoints: number,
) {
  let base32 = '';
  const isFirstInPathSegment = index === 0;
  const isLastInPathSegment = index === totalPoints - 1;

  const encodeSign = (value: number): SignChar => {
    return value > 0 ? '1' : '0';
  };

  if (isFirstInPathSegment || isLastInPathSegment) {
    const handleRelativeYCoordinate =
      point.handles[0].position.y - point.position.y;
    base32 += encodeBase32Value(point.position.y);
    base32 += encodeBase32Value(
      Math.abs(point.handles[0].position.x - point.position.x),
    );
    base32 += encodeSign(handleRelativeYCoordinate);
    base32 += encodeBase32Value(Math.abs(handleRelativeYCoordinate));
  } else {
    if (point.handles.length !== 2) {
      throw new Error("The specified Point or it's index is invalid.");
    }

    const encodeHandle = (j: number): void => {
      const relativeYCoordinate =
        point.handles[j].position.y - point.position.y;

      base32 += encodeBase32Value(
        Math.abs(point.position.x - point.handles[j].position.x),
      );
      base32 += encodeSign(relativeYCoordinate);
      base32 += encodeBase32Value(Math.abs(relativeYCoordinate));
    };

    base32 += encodeBase32Value(point.position.x);
    base32 += encodeBase32Value(point.position.y);
    encodeHandle(0);
    encodeHandle(1);
  }

  return base32;
}

export function encodePathFromPalette(palette: Palette): string {
  const graphPathSegment = COLOR_MODES.reduce<string>(
    (graphPathAcc, colorMode) => {
      const pointCount = palette.graph[colorMode].points.length;
      const pointsPathSegment = palette.graph[colorMode].points.reduce<string>(
        (pointsPathAcc, point, index) => {
          console.log(pointCount, index, point);
          return `${pointsPathAcc}${encodeGraphPoint(
            point,
            index,
            pointCount,
          )}-`;
        },
        '',
      );
      return (graphPathAcc += `${PATH_COLOR_MODE_ABBREVIATION[colorMode]}-${pointsPathSegment}`);
    },
    '',
  );

  const swatchesPathSegment =
    PATH_SWATCHES_ABBREVIATION +
    palette.swatches.reduce<string>((swatchesPathAcc, swatch) => {
      return `${swatchesPathAcc}-${encodeSwatch(swatch)}`;
    }, '');

  return graphPathSegment + swatchesPathSegment;
}
