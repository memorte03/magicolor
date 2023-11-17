import { calculateGraphPosition } from './position';
import { GraphDimensions, Point, PointHandles } from '@/types';

export function calculateGraphPoints(
  points: Point[],
  graphDimensions: GraphDimensions,
): Point[] {
  return points.map((point) => ({
    ...point,
    position: {
      x: calculateGraphPosition(point.position.x, graphDimensions.width),
      y: calculateGraphPosition(point.position.y, graphDimensions.height),
    },
    // handles: point.handles,
    handles: point.handles.map((handle) => ({
      relativePosition: {
        x: calculateGraphPosition(
          handle.relativePosition.x,
          graphDimensions.width,
        ),
        y: calculateGraphPosition(
          handle.relativePosition.y,
          graphDimensions.height,
        ),
      },
    })) as PointHandles,
  }));
}
