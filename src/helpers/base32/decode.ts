import { v4 as uuidv4 } from 'uuid';

import trimBezierSegment from '../trimBezierSegment';

import {
  BASE32_DECODE_CHAR,
  PATH_COLOR_MODE_SEGMENT_COUNT,
  SIGN_DECODE_CHAR,
  SignChar,
  SignValue,
  testBase32,
} from './index';
import { Bezier } from '@/classes';
import {
  COLOR_MODES,
  MAX_GRAPH_X_COORDINATE,
  MIN_GRAPH_X_COORDINATE,
} from '@/constants';
import { ColorMode, Palette, Point, Segment, Swatch } from '@/types';

/**
 *
 * @param base32 - base 32 string that's meant for decoding
 * @returns decoded numerical value
 */
export function decodeBase32Value(base32: string): number {
  return base32
    .split('')
    .reverse()
    .reduce((acc, char, i) => {
      const charValue =
        BASE32_DECODE_CHAR[char as keyof typeof BASE32_DECODE_CHAR];
      if (charValue === undefined) {
        throw new Error(`Invalid character '${char}' in base32 string.`);
      }
      return acc + charValue * Math.pow(32, i);
    }, 0);
}

/**
 *
 * @param base32 - base 32 string of the swatch meant for decoding
 * @returns decoded Swatch Object
 */
export function decodeSwatch(base32: string): Swatch {
  return { point: decodeBase32Value(base32) };
}

/**
 *
 * @param base32 - base 32 string of the point meant for decoding
 * @param colorMode - color sub-path that's currently being decoded
 * @param index - index of the given point
 * @returns decoded point Object
 */

export function decodeGraphPoint(
  base32: string,
  colorMode: ColorMode,
  index: number,
): Point {
  const point: Partial<Point> = {
    uuid: uuidv4(),
    colorMode: colorMode,
  } as const;

  const decodeCoordinate = (j: number): number => {
    return decodeBase32Value(base32.slice(j, j + 2));
  };

  const decodeSign = (j: number): SignValue => {
    const char = base32[j];
    if (Object.keys(SIGN_DECODE_CHAR).includes(char)) {
      return SIGN_DECODE_CHAR[char as SignChar];
    } else {
      throw new Error(
        'The specified base32 path does not match the required pattern format.',
      );
    }
  };

  if (base32.length === 7) {
    const isFirstInPathSegment = index === 0;

    const x = isFirstInPathSegment
      ? MIN_GRAPH_X_COORDINATE
      : MAX_GRAPH_X_COORDINATE;
    const y = decodeCoordinate(0);

    return {
      ...point,
      position: {
        x: x,
        y: y,
      },
      handles: [
        {
          position: {
            x:
              x +
              (isFirstInPathSegment
                ? decodeCoordinate(2)
                : -decodeCoordinate(2)),
            y: y + decodeSign(4) * decodeCoordinate(5),
          },
        },
      ],
    } as Point;
  } else if (base32.length === 14) {
    const x = decodeCoordinate(0);
    const y = decodeCoordinate(2);
    return {
      ...point,
      position: {
        x: x,
        y: y,
      },
      handles: [
        {
          position: {
            x: x - decodeCoordinate(4),
            y: y + decodeSign(6) * decodeCoordinate(7),
          },
        },
        {
          position: {
            x: x + decodeCoordinate(9),
            y: y + decodeSign(11) * decodeCoordinate(12),
          },
        },
      ],
    } as Point;
  } else {
    throw new Error(
      'The specified base32 path does not match the required pattern format.',
    );
  }
}

export function decodePaletteFromPath(base32: string): Palette {
  if (!testBase32(base32)) {
    throw new Error(`Invalid base32 string ${base32}`);
  }

  const pathSegments = base32.split(/h-|-s-|-l-|-p-/).slice(1);

  const palette = pathSegments
    .slice(0, PATH_COLOR_MODE_SEGMENT_COUNT)
    .reduce<Palette>((paletteAcc, pathSegment, index) => {
      const points = pathSegment
        .split('-')
        .map(
          (point, j): Point => decodeGraphPoint(point, COLOR_MODES[index], j),
        );

      const segments = points.reduce<Segment[]>((segmentsAcc, point, j) => {
        if (!(j < points.length - 1)) {
          return segmentsAcc;
        }

        const nextPoint = points[j + 1];

        const segment = trimBezierSegment(
          point.position.x,
          nextPoint.position.x,
          {
            startPointUuid: point.uuid,
            endPointUuid: nextPoint.uuid,
            curve: new Bezier([point, nextPoint]).toFlatArray(),
          },
        );

        return [...segmentsAcc, segment];
      }, []);

      return {
        ...paletteAcc,
        graph: {
          ...paletteAcc.graph,
          [COLOR_MODES[index]]: {
            points,
            segments,
          },
        },
      };
    }, {} as Palette);

  const swatches: Swatch[] = pathSegments
    .at(-1)!
    .split('-')
    .map((encodedSwatch) => decodeSwatch(encodedSwatch));

  return {
    ...palette,
    swatches: swatches,
  };
}
