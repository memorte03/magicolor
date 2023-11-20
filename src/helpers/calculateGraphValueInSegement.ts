import { Point } from '@/types';

// Calculate y value from x in a given segment, it means, between 2 points

export default function calculateGraphValueInSegment(
  point1: Point,
  point2: Point,
  x: number,
): number {
  if (point1.position.x > x || point2.position.x < x) {
    throw new Error('Given x coordinate is out of range!');
  }

  return 1;
}
