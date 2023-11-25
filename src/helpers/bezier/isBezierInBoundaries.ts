import {
  BEZIER_CURVE_INACCURACY,
  MAX_GRAPH_X_COORDINATE,
  MAX_GRAPH_Y_COORDINATE,
  MIN_GRAPH_X_COORDINATE,
  MIN_GRAPH_Y_COORDINATE,
} from '@/constants';
import { Axis, BezierPoints } from '@/types';

export default function isBezierInBoundaries(
  points: BezierPoints,
  axis: Axis,
  boundaryDirection: 'min' | 'max',
): boolean {
  const steps = Math.ceil(
    (points.p3[axis] - points.p1[axis]) / BEZIER_CURVE_INACCURACY,
  );

  const boundary =
    boundaryDirection === 'min'
      ? Math.max(
          points.p0[axis],
          axis === 'x' ? MIN_GRAPH_X_COORDINATE : MIN_GRAPH_Y_COORDINATE,
        )
      : Math.min(
          points.p3[axis],
          axis === 'x' ? MAX_GRAPH_X_COORDINATE : MAX_GRAPH_Y_COORDINATE,
        );

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const coord = Math.round(
      (1 - t) ** 3 * points.p0[axis] +
        3 * (1 - t) ** 2 * t * points.p1[axis] +
        3 * (1 - t) * t ** 2 * points.p2[axis] +
        t ** 3 * points.p3[axis],
    );

    if (
      (boundaryDirection === 'min' && coord < boundary) ||
      (boundaryDirection === 'max' && coord > boundary)
    ) {
      return false;
    }
  }

  return true;
}
