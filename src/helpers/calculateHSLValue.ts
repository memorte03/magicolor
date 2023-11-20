import getPointOnPath from './getCubicBezierPoint';
import { Point } from '@/types';

const getPointValue = (v: number) => {
  return v / 4;
};

export function calculateHSLValue(
  points: Point[],
  x: number,
  canvasWidth: number,
): number {
  // Normalize x to a 0-1 range
  const t = x / canvasWidth;
  return getPointValue(getPointOnPath(t, points).y);
}
