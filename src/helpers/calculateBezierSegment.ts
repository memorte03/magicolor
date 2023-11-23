// Calculate Bezier curve between two given points using the De Casteljau's algorithm

// import { mark, printBenchmark } from './benchmark';
import { mark, printBenchmark } from './benchmark';
import { Bezier } from '@/classes';
import { Point, Position } from '@/types';

export function calculateBezierSegment1(point1: Point, point2: Point) {
  // Convert store positions to calculation-ready positions
  const p0 = point1.position;
  const p3 = point2.position;

  const p1 = point1.handles.at(-1)!.position; // First control point
  const p2 = point1.handles[0].position; // Second control point

  const deltaX = Math.abs(p3.x - p0.x);
  const length = deltaX + 1;
  const curve = new Array(length);

  for (let i = 0; i < length; i++) {
    const t = i / deltaX;
    const x =
      (1 - t) ** 3 * p0.x +
      3 * (1 - t) ** 2 * t * p1.x +
      3 * (1 - t) * t ** 2 * p2.x +
      t ** 3 * p3.x;
    const y =
      (1 - t) ** 3 * p0.y +
      3 * (1 - t) ** 2 * t * p1.y +
      3 * (1 - t) * t ** 2 * p2.y +
      t ** 3 * p3.y;

    curve[i] = [x, y];
  }

  return curve;
}

export function calculateBezierSegment2(point1: Point, point2: Point) {
  // Convert store positions to calculation-ready positions
  const p0 = point1.position;
  const p3 = point2.position;

  const p1 = point1.handles.at(-1)!.position; // First control point
  const p2 = point1.handles[0].position; // Second control point

  const steps = Math.ceil((point2.position.x - point1.position.x) / 2);
  const curve = new Array(steps);

  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const x =
      (1 - t) ** 3 * p0.x +
      3 * (1 - t) ** 2 * t * p1.x +
      3 * (1 - t) * t ** 2 * p2.x +
      t ** 3 * p3.x;
    const y =
      (1 - t) ** 3 * p0.y +
      3 * (1 - t) ** 2 * t * p1.y +
      3 * (1 - t) * t ** 2 * p2.y +
      t ** 3 * p3.y;

    curve[i] = [x, y];
  }

  return curve;
}

type calculateBezierSegmentReturnType =
  | {
      curve: number[][];
      isOverlapping: true;
      overlapPointPosition: Position;
    }
  | {
      curve: number[][];
      isOverlapping: false;
    };

// eslint-disable-next-line sonarjs/cognitive-complexity
export function calculateBezierSegment(
  point1: Point,
  point2: Point,
): calculateBezierSegmentReturnType {
  // Convert store positions to calculation-ready positions
  const p0 = point1.position;
  const p3 = point2.position;

  const p1 = point1.handles.at(-1)!.position; // First control point
  const p2 = point2.handles[0].position; // Second control point

  // The divider specifies the accuracy. The lower the divider, the higher the accuracy
  // TODO: When using lover accuracy the curves sometimes become disconnected on the bend
  const steps = Math.ceil((point2.position.x - point1.position.x) / 3);

  if (steps < 0) return { curve: [], isOverlapping: false };
  const curve = new Array(steps);
  let isOverlapping = false;
  let overlapPointPosition: Position | undefined = undefined;

  let prevX = p0.x;
  let prevY = p0.y;

  // Calculate bezier points for Ts
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(
      (1 - t) ** 3 * p0.x +
        3 * (1 - t) ** 2 * t * p1.x +
        3 * (1 - t) * t ** 2 * p2.x +
        t ** 3 * p3.x,
    );
    const y = Math.round(
      (1 - t) ** 3 * p0.y +
        3 * (1 - t) ** 2 * t * p1.y +
        3 * (1 - t) * t ** 2 * p2.y +
        t ** 3 * p3.y,
    );

    // Determine the direction of the curve for interpolation
    const step = x > prevX ? 1 : -1;
    if (x < prevX && !isOverlapping) {
      isOverlapping = true;
      overlapPointPosition = { x, y };
    }
    // Interpolate and fill gaps
    if (Math.abs(x - prevX) > 1) {
      for (let j = prevX + step; j !== x; j += step) {
        const interpolatedY = Math.round(
          prevY + ((y - prevY) * (j - prevX)) / (x - prevX),
        );
        curve[j] = curve[j] || [];
        curve[j].push(interpolatedY);
      }
    }
    // Store current point
    curve[x] = curve[x] || [];
    if (!curve[x].includes(y)) {
      curve[x].push(y);
    }

    prevX = x;
    prevY = y;
  }

  if (isOverlapping) {
    return {
      curve,
      isOverlapping,
      overlapPointPosition: overlapPointPosition as Position,
    };
  } else {
    return {
      curve,
      isOverlapping,
    };
  }
}

export function benchmarkBezier(point1: Point, point2: Point) {
  mark('bezier1 start');
  for (let i = 0; i < 1000; i++) {
    calculateBezierSegment1(point1, point2);
  }
  mark('bezier1 end');

  mark('bezier2 start');
  for (let i = 0; i < 1000; i++) {
    calculateBezierSegment2(point1, point2);
  }
  mark('bezier2 end');

  mark('bezier3 start');
  for (let i = 0; i < 1000; i++) {
    calculateBezierSegment(point1, point2);
  }
  mark('bezier3 end');

  mark('bezier4 start');
  for (let i = 0; i < 10; i++) {
    const bezier = new Bezier([point1, point2]).toFlatArray();
    console.log(bezier);
    // console.log(bezier);
  }
  mark('bezier4 end');
  printBenchmark();

  console.log(calculateBezierSegment(point1, point2));
}
