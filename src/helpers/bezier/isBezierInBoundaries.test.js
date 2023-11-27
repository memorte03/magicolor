import { describe, expect, it } from '@jest/globals';

import isBezierInBoundaries from './isBezierInBoundaries';

describe('isBezierInBoundaries', () => {
  it('should return false when curve is out of top bounds', () => {
    expect(
      isBezierInBoundaries(
        {
          p0: { x: 0, y: 256 },
          p1: { x: 0, y: 20 },
          p2: { x: 1000, y: -120 },
          p3: { x: 1024, y: 40 },
        },
        'y',
        'min',
      ),
    ).toEqual(false);
  });
  
  it('should return false when curve is out of bottom bounds - test 1', () => {
    expect(
      isBezierInBoundaries(
        {
          p0: { x: 0, y: 256 },
          p1: { x: 147, y: 1020 },
          p2: { x: 664, y: 1300 },
          p3: { x: 1024, y: 1024 },
        },
        'y',
        'max',
      ),
    ).toEqual(false);
  });
  it('should return false when curve is out of bottom bounds - test 2', () => {
    expect(
      isBezierInBoundaries(
        {
          p0: { x: 0, y: 256 },
          p1: { x: 860, y: 1956 },
          p2:{ x: 74, y: 1156 },
          p3: { x: 1118, y: 1212 },
        },
        'y',
        'max',
      ),
    ).toEqual(false);
  });
  it('should return false when curve is out of bottom bounds - test 3', () => {
    expect(
      isBezierInBoundaries(
        {
          p0: { x: 0, y: 256 },
          p1: { x: 690, y: 1160 },
          p2:{ x: 350, y: 1972 },
          p3: { x: 575, y: 1176 },
        },
        'y',
        'max',
      ),
    ).toEqual(false);
  });
  it('should return false when curve is out of left bounds', () => {
    expect(
      isBezierInBoundaries(
        {
          p0: { x: -90, y: 256 },
          p1: { x: 147, y: 256 },
          p2: { x: 1000, y: 640 },
          p3: { x: 1024, y: 1024 },
        },
        'x',
        'min',
      ),
    ).toEqual(false);
  });
  
});
