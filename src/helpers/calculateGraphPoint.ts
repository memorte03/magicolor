import { calculateGraphPosition } from './position';
import { GraphDimensions, Point } from '@/types';

export default function calculateGraphPoint(
  point: Point,
  graphDimensions: GraphDimensions,
) {
  return {
    x: calculateGraphPosition(point.position.x, graphDimensions.width),
    y: calculateGraphPosition(point.position.y, graphDimensions.height),
    handles: point.handles.map((handle) => ({
      x: calculateGraphPosition(
        point.position.x + handle.relativePosition.x,
        graphDimensions.width,
      ),
      y: calculateGraphPosition(
        point.position.y + handle.relativePosition.y,
        graphDimensions.height,
      ),
    })),
  };
}
