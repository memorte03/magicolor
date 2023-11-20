import { Point, Position } from '@/types';

export default function calculateClosestBezierPoint(
  points: [Point, Point],
  cursorPosition: Position,
): [number, number] {
  const [startPoint, endPoint] = points;
  const startHandle = startPoint.handles[0];
  const endHandle = endPoint.handles[0];

  // Convert relative handle positions to absolute
  const startHandleAbs = {
    x: startHandle.position.x,
    y: startHandle.position.y,
  };
  const endHandleAbs = {
    x: endHandle.position.x,
    y: endHandle.position.y,
  };

  // Cubic Bezier function for x and y
  const bezier = (
    t: number,
    p0: number,
    p1: number,
    p2: number,
    p3: number,
  ) => {
    const oneMinusT = 1 - t;
    return (
      Math.pow(oneMinusT, 3) * p0 +
      3 * Math.pow(oneMinusT, 2) * t * p1 +
      3 * oneMinusT * Math.pow(t, 2) * p2 +
      Math.pow(t, 3) * p3
    );
  };

  // Function to calculate distance between two points
  const distance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  // Iterate over the curve to find the closest point
  let closestPoint: [number, number] = [
    startPoint.position.x,
    startPoint.position.y,
  ];
  let minDistance = distance(
    cursorPosition.x,
    cursorPosition.y,
    closestPoint[0],
    closestPoint[1],
  );
  const sampleRate = 0.01; // Adjust sample rate for more precision

  for (let t = 0; t <= 1; t += sampleRate) {
    const x = bezier(
      t,
      startPoint.position.x,
      startHandleAbs.x,
      endHandleAbs.x,
      endPoint.position.x,
    );
    const y = bezier(
      t,
      startPoint.position.y,
      startHandleAbs.y,
      endHandleAbs.y,
      endPoint.position.y,
    );

    const currentDistance = distance(cursorPosition.x, cursorPosition.y, x, y);
    if (currentDistance < minDistance) {
      minDistance = currentDistance;
      closestPoint = [x, y];
    }
  }

  return closestPoint;
}
