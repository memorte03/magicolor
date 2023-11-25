import {
  BEZIER_CURVE_INACCURACY,
  MAX_GRAPH_X_COORDINATE,
  MAX_GRAPH_Y_COORDINATE,
  MIN_GRAPH_X_COORDINATE,
  MIN_GRAPH_Y_COORDINATE,
} from '@/constants';
import isBezierInBoundaries from '@/helpers/bezier/isBezierInBoundaries';
import { Axis, BezierPointName, BezierPoints, Point, Position } from '@/types';

type BoundaryDimension = 'maxX' | 'minX' | 'maxY' | 'minY';
type FinalPosition = {
  x: null | number;
  y: null | number;
};
type IsOutOfBounds = {
  min: {
    [key in Axis]: boolean;
  };
  max: {
    [key in Axis]: boolean;
  };
};

const POINT_HANDLE = {
  p0: 'p1',
  p3: 'p2',
} as const;

export const isBezierPoints = (obj: any): obj is BezierPoints => {
  return 'p0' in obj && 'p1' in obj && 'p2' in obj && 'p3' in obj;
};

export default class Bezier {
  points: BezierPoints;
  isDoublingBack: boolean;
  isOutOfBounds: IsOutOfBounds;
  curve: Position[];

  constructor(points: [Point, Point] | BezierPoints) {
    this.isOutOfBounds = {
      min: { x: false, y: false },
      max: { x: false, y: false },
    };
    this.isDoublingBack = false;
    this.curve = [];

    this.points = isBezierPoints(points)
      ? points
      : {
          p0: points[0].position, // First point
          p3: points[1].position, // Second point
          p1: points[0].handles.at(-1)!.position, // First control point
          p2: points[1].handles[0].position,
        };

    this.computeCurve();
  }

  private updateBounds(x: number, y: number) {
    this.isOutOfBounds.max.x =
      this.isOutOfBounds.max.x || x > MAX_GRAPH_X_COORDINATE;
    this.isOutOfBounds.min.x =
      this.isOutOfBounds.min.x || x < MIN_GRAPH_X_COORDINATE;
    this.isOutOfBounds.max.y =
      this.isOutOfBounds.max.y || y > MAX_GRAPH_Y_COORDINATE;
    this.isOutOfBounds.min.y =
      this.isOutOfBounds.min.y || y < MIN_GRAPH_Y_COORDINATE;
  }

  private computeCurve() {
    // The divider specifies the accuracy. The lower the divider, the higher the accuracy
    // TODO: When using lover accuracy the curves sometimes become disconnected on the bend
    const steps = Math.ceil(
      (this.points.p3.x - this.points.p1.x) / BEZIER_CURVE_INACCURACY,
    );

    if (steps > 0) {
      const curve = new Array(steps);

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = Math.round(
          (1 - t) ** 3 * this.points.p0.x +
            3 * (1 - t) ** 2 * t * this.points.p1.x +
            3 * (1 - t) * t ** 2 * this.points.p2.x +
            t ** 3 * this.points.p3.x,
        );
        const y = Math.round(
          (1 - t) ** 3 * this.points.p0.y +
            3 * (1 - t) ** 2 * t * this.points.p1.y +
            3 * (1 - t) * t ** 2 * this.points.p2.y +
            t ** 3 * this.points.p3.y,
        );

        this.updateBounds(x, y);
        curve[i] = { x: x, y: y };
      }
      this.curve = curve;
    } else {
      this.curve = [];
      this.isDoublingBack = false;
    }
  }

  toFlatArray(): number[] {
    const flatArray: number[] = new Array(
      Math.round(this.points.p3.x) + 1,
    ).fill(null);

    this.curve.forEach((coord, index) => {
      if (index === 0) {
        flatArray[coord.x] = coord.y;
      } else {
        const prevCoord = this.curve[index - 1];
        const step = coord.x > prevCoord.x ? 1 : -1;

        // Interpolate and fill the gaps
        for (let x = prevCoord.x; x !== coord.x; x += step) {
          if (flatArray[x] === null) {
            // Only interpolate if not already set
            const interpolatedY =
              prevCoord.y +
              ((coord.y - prevCoord.y) * (x - prevCoord.x)) /
                (coord.x - prevCoord.x);
            flatArray[x] = Math.round(interpolatedY);
          }
        }
        flatArray[coord.x] = coord.y; // Set the current point
      }
    });

    return flatArray;
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  getBoundaries(movedPointName: BezierPointName, prevPosition: Position) {
    // The position user intends to move the given point
    const requestedPosition = this.points[movedPointName];

    const calculateBoundary = (
      axis: Axis,
      boundaryDirection: 'min' | 'max',
      // eslint-disable-next-line sonarjs/cognitive-complexity
    ): number => {
      /*
        Set one side of boundaries, trusting that the previous position is correct. 
        Might not be the best practice, but saves a lot of computation and allows 
        to adjust partially broken curves if they somehow occur
      */
      // Return the previous position if it's on the right side
      if (
        (boundaryDirection === 'min' &&
          prevPosition[axis] < requestedPosition[axis]) ||
        (boundaryDirection === 'max' &&
          prevPosition[axis] > requestedPosition[axis])
      ) {
        return prevPosition[axis];
      }

      // Return the new position if it's on the right side and inside of bounds
      if (!this.isOutOfBounds[boundaryDirection][axis]) {
        return requestedPosition[axis];
      }

      const binarySearchBoundary = (low: number, high: number): number => {
        if (low > high) {
          return high; // Or return low, depending on your boundary requirements
        }

        const mid = Math.floor((low + high) / 2);
        let testPoints: BezierPoints = {
          ...this.points,
          [movedPointName]:
            axis === 'x'
              ? { y: this.points[movedPointName].y, x: mid }
              : { x: this.points[movedPointName].x, y: mid },
        };

        // Adjust handle positions if moving p0 or p3
        if (movedPointName === 'p0' || movedPointName === 'p3') {
          const handlePointName = movedPointName === 'p0' ? 'p1' : 'p2';
          const offset =
            axis === 'x'
              ? this.points[handlePointName].x - this.points[movedPointName].x
              : this.points[handlePointName].y - this.points[movedPointName].y;

          testPoints[handlePointName] = {
            ...this.points[handlePointName],
            x: axis === 'x' ? mid + offset : this.points[handlePointName].x,
            y: axis === 'x' ? this.points[handlePointName].y : mid + offset,
          };
        }

        const isOutOfBounds = !isBezierInBoundaries(
          testPoints,
          axis,
          boundaryDirection,
        );

        if (isOutOfBounds) {
          return boundaryDirection === 'max'
            ? binarySearchBoundary(low, mid - 1)
            : binarySearchBoundary(mid + 1, high);
        } else {
          return boundaryDirection === 'max'
            ? binarySearchBoundary(mid + 1, high)
            : binarySearchBoundary(low, mid - 1);
        }
      };

      return binarySearchBoundary(
        Math.min(prevPosition[axis], requestedPosition[axis]),
        Math.max(prevPosition[axis], requestedPosition[axis]),
      );
    };

    return {
      min: {
        x: calculateBoundary('x', 'min'),
        y: calculateBoundary('y', 'min'),
      },
      max: {
        x: calculateBoundary('x', 'max'),
        y: calculateBoundary('y', 'max'),
      },
    };
  }
}
