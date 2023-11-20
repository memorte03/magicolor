// Adjust handles position after moving the point

import { Point, PointHandles, Position } from '@/types';

export default function adjustPointHandles(
  point: Point,
  position: Position,
): PointHandles {
  const xDif = position.x - point.position.x;
  const yDif = position.y - point.position.y;

  return point.handles.map((handle) => ({
    ...handle,
    position: {
      x: handle.position.x + xDif,
      y: handle.position.y + yDif,
    },
  })) as PointHandles;
}
