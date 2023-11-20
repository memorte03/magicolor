import { Point } from '@/types';

interface Position {
  x: number;
  y: number;
}

function getCubicBezierPoint(
  t: number,
  p0: Position,
  p1: Position,
  p2: Position,
  p3: Position,
) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  const a = mt2 * mt;
  const b = 3 * mt2 * t;
  const c = 3 * mt * t2;
  const d = t * t2;

  const x = a * p0.x + b * p1.x + c * p2.x + d * p3.x;
  const y = a * p0.y + b * p1.y + c * p2.y + d * p3.y;

  return { x, y };
}

export default function getPointOnPath(t: number, path: Point[]) {
  // Ensure t is between 0 and 1
  t = Math.max(0, Math.min(1, t));

  // Find which segment t falls within on the path
  const numSegments = path.length - 1;
  const segmentIndex = Math.floor(t * numSegments);
  const segmentT = t * numSegments - segmentIndex;

  // console.log(path[segmentIndex]);

  const p0 = path[segmentIndex].position;
  const p1 = {
    x: path[segmentIndex].handles.at(-1)?.position.x,
    y: path[segmentIndex].handles.at(-1)?.position.y,
  };

  let p2, p3;
  if (segmentIndex + 1 < path.length) {
    p2 = {
      x: path[segmentIndex + 1].handles[0].position.x,
      y: path[segmentIndex + 1].handles[0].position.y,
    };
    p3 = path[segmentIndex + 1].position;
  } else {
    // Handle the case where segmentIndex + 1 is out of bounds.
    // Perhaps set p2 and p3 equal to some default values, or p0 and p1 respectively.
    p2 = p1;
    p3 = p0;
  }

  return getCubicBezierPoint(segmentT, p0, p1, p2, p3);
}
