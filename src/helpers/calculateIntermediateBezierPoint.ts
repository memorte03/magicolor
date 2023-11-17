import { v4 as uuidv4 } from 'uuid';

import { Point } from '@/types';

export default function calculateIntermediateBezierPoint(
  points: [Point, Point],
  x: number,
): Point {
  if (points.length !== 2) {
    throw new Error(
      'Invalid input: points array must have exactly two points.',
    );
  }

  // Extracting the points and their handles
  const [startPoint, endPoint] = points;
  const startHandle = startPoint.handles[1] ?? startPoint.handles[0];
  const endHandle = endPoint.handles[0] ?? endPoint.handles[1];

  // Linear interpolation function
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  // Calculate t based on the x position (assuming linear x progression)
  const dx = endPoint.position.x - startPoint.position.x;
  const t = (x - startPoint.position.x) / dx;

  // Calculate intermediate positions
  const mx = lerp(startPoint.position.x, startHandle.relativePosition.x, t);
  const my = lerp(startPoint.position.y, startHandle.relativePosition.y, t);
  const nx = lerp(endHandle.relativePosition.x, endPoint.position.x, t);
  const ny = lerp(endHandle.relativePosition.y, endPoint.position.y, t);

  // Calculate final point position
  const finalX = lerp(mx, nx, t);
  const finalY = lerp(my, ny, t);

  // Return the new point
  return {
    uuid: uuidv4(),
    position: {
      x: finalX,
      y: finalY,
    },
    handles: [
      {
        relativePosition: { x: mx, y: my },
      },
      {
        relativePosition: { x: nx, y: ny },
      },
    ],
    colorMode: startPoint.colorMode,
  };
}
