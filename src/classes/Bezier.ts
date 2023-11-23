import {
  BEZIER_CURVE_INACCURACY,
  MAX_GRAPH_X_COORDINATE,
  MAX_GRAPH_Y_COORDINATE,
  MIN_GRAPH_X_COORDINATE,
  MIN_GRAPH_Y_COORDINATE,
} from '@/constants';
import { Point, Position } from '@/types';

type BoundaryDimension = 'maxX' | 'minX' | 'maxY' | 'minY';
type BezierPointName = 'p0' | 'p1' | 'p2' | 'p3';
type BezierPoints = {
  [key in BezierPointName]: Position;
};

const isBezierPoints = (obj: any): obj is BezierPoints => {
  return 'p0' in obj && 'p1' in obj && 'p2' in obj && 'p3' in obj;
};

export default class Bezier {
  points: BezierPoints;
  isDoublingBack: boolean;
  isOutOfLeftBounds: boolean;
  isOutOfRightBounds: boolean;
  isOutOfTopBounds: boolean;
  isOutOfBottomBounds: boolean;
  curve: Position[];

  constructor(points: [Point, Point] | BezierPoints) {
    this.isDoublingBack = false;
    this.curve = [];
    this.isOutOfTopBounds = false;
    this.isOutOfRightBounds = false;
    this.isOutOfBottomBounds = false;
    this.isOutOfLeftBounds = false;

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
    this.isOutOfTopBounds = this.isOutOfTopBounds || y > MAX_GRAPH_Y_COORDINATE;
    this.isOutOfBottomBounds =
      this.isOutOfBottomBounds || y < MIN_GRAPH_Y_COORDINATE;
    this.isOutOfRightBounds =
      this.isOutOfRightBounds || x > MAX_GRAPH_X_COORDINATE;
    this.isOutOfLeftBounds =
      this.isOutOfLeftBounds || x < MIN_GRAPH_X_COORDINATE;
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
  getBoundaryValue(
    movedPoint: BezierPointName,
    prevPosition: Position,
    BoundaryDimension: BoundaryDimension,
  ): number {
    const isMax = BoundaryDimension.includes('max');
    const isX = BoundaryDimension.includes('X');

    const binarySearchBoundary = (low: number, high: number): number => {
      if (low > high) {
        return isMax ? high : low;
      }

      const mid = Math.floor((low + high) / 2);
      let testPosition: BezierPoints = {
        ...this.points,
        [movedPoint]: isX
          ? { y: this.points[movedPoint].y, x: mid }
          : { x: this.points[movedPoint].x, y: mid },
      };

      // Adjust handle positions if moving p0 or p3
      if (movedPoint === 'p0' || movedPoint === 'p3') {
        const handlePointName = movedPoint === 'p0' ? 'p1' : 'p2';
        const offset = isX
          ? this.points[handlePointName].x - this.points[movedPoint].x
          : this.points[handlePointName].y - this.points[movedPoint].y;

        testPosition = {
          ...this.points,
          [movedPoint]: isX
            ? { ...this.points[movedPoint], x: mid }
            : { ...this.points[movedPoint], y: mid },
          [handlePointName]: isX
            ? {
                ...this.points[handlePointName],
                x: mid + offset,
              }
            : {
                ...this.points[handlePointName],
                y: mid + offset,
              },
        };
      }

      const testBezier = new Bezier(testPosition);
      const outOfBounds = isX
        ? isMax
          ? testBezier.isOutOfRightBounds
          : testBezier.isOutOfLeftBounds
        : isMax
        ? testBezier.isOutOfTopBounds
        : testBezier.isOutOfBottomBounds;

      if (outOfBounds) {
        return isMax
          ? binarySearchBoundary(low, mid - 1)
          : binarySearchBoundary(mid + 1, high);
      } else {
        return isMax
          ? binarySearchBoundary(mid + 1, high)
          : binarySearchBoundary(low, mid - 1);
      }
    };

    const start = isX ? prevPosition.x : prevPosition.y;
    const end = isX ? this.points[movedPoint].x : this.points[movedPoint].y;

    return binarySearchBoundary(start, end);
  }

  getBoundMaxX(movedPoint: BezierPointName, prevPosition: Position): number {
    return this.getBoundaryValue(movedPoint, prevPosition, 'maxX');
  }

  getBoundMinX(movedPoint: BezierPointName, prevPosition: Position): number {
    return this.getBoundaryValue(movedPoint, prevPosition, 'minX');
  }

  getBoundMaxY(movedPoint: BezierPointName, prevPosition: Position): number {
    return this.getBoundaryValue(movedPoint, prevPosition, 'maxY');
  }

  getBoundMinY(movedPoint: BezierPointName, prevPosition: Position): number {
    return this.getBoundaryValue(movedPoint, prevPosition, 'minY');
  }
}
