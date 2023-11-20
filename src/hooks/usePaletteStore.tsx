import { RefObject } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

import {
  MAX_GRAPH_X_COORDINATE,
  MAX_GRAPH_Y_COORDINATE,
  MIN_GRAPH_X_COORDINATE,
  MIN_GRAPH_Y_COORDINATE,
  POINT_MARGIN,
} from '@/constants';
import adjustPointHandles from '@/helpers/adjustPointHandles';
import { decodeGraphPoint, decodeSwatch } from '@/helpers/base32';
import { calculateBezierSegment } from '@/helpers/calculateBezierSegment';
import calculateIntermediateBezierPoint from '@/helpers/calculateIntermediateBezierPoint';
import { calculateStorePosition } from '@/helpers/position';
import {
  Axis,
  ColorMode,
  GraphDimensions,
  Palette,
  Point,
  Position,
  Segment,
} from '@/types';

const initialGraphRef: RefObject<HTMLDivElement> | null = null;

export const initialPalette: Palette = {
  graph: {
    hue: {
      points: [
        {
          uuid: uuidv4(),
          colorMode: 'hue',
          position: {
            x: 0,
            y: 256,
          },
          handles: [
            {
              position: {
                x: 10,
                y: 200,
              },
            },
          ],
        },
        {
          uuid: uuidv4(),
          colorMode: 'hue',
          position: {
            x: 1024,
            y: 256,
          },
          handles: [
            {
              position: {
                x: -20,
                y: 200,
              },
            },
          ],
        },
      ],
      segments: [],
    },
    light: {
      points: [
        {
          uuid: uuidv4(),
          colorMode: 'light',
          position: {
            x: 0,
            y: 256,
          },
          handles: [
            {
              position: {
                x: 10,
                y: 200,
              },
            },
          ],
        },
        {
          uuid: uuidv4(),
          colorMode: 'light',
          position: {
            x: 1024,
            y: 256,
          },
          handles: [
            {
              position: {
                x: -20,
                y: 200,
              },
            },
          ],
        },
      ],
      segments: [],
    },
    saturation: {
      points: [
        {
          uuid: uuidv4(),
          colorMode: 'saturation',
          position: {
            x: 0,
            y: 256,
          },
          handles: [
            {
              position: {
                x: 10,
                y: 200,
              },
            },
          ],
        },
        {
          uuid: uuidv4(),
          colorMode: 'saturation',
          position: {
            x: 1024,
            y: 256,
          },
          handles: [
            {
              position: {
                x: -20,
                y: 200,
              },
            },
          ],
        },
      ],
      segments: [],
    },
  },
  segments: [],
  swatches: [
    {
      point: 10,
    },
  ],
};

const initialGraphDimensions: GraphDimensions = {
  width: 1024,
  height: 512,
};

interface PaletteState {
  graphDimensions: GraphDimensions;
  palette: Palette;
  graphRef: RefObject<HTMLDivElement> | null;
  selectedColorMode: ColorMode;

  // Helpers
  normalizeCoordinate: (coordinate: number, axis: Axis) => number;
  normalizePosition: (position: Position) => Position;

  setGraphRef: (ref: RefObject<HTMLDivElement>) => void;
  setDataFromBase32: (base32: string) => void;
  setGraphDimensions: () => void;

  movePoint: (uuid: string, position: Position) => void;
  addPoint: (points: [Point, Point], cursorPosition: Position) => void;
  removePoint: () => void;

  moveHandle: (
    point: Point,
    newPosition: Position,
    handleIndex: number,
  ) => void;
}

const usePaletteStore = create<PaletteState>((set, get) => ({
  palette: initialPalette,
  graphDimensions: initialGraphDimensions,
  graphRef: initialGraphRef,
  selectedColorMode: 'hue',

  // Helpers
  normalizeCoordinate: (coordinate, axis) => {
    return Math.floor(
      (coordinate / get().graphDimensions[axis === 'x' ? 'width' : 'height']) *
        (axis === 'x' ? MAX_GRAPH_X_COORDINATE : MAX_GRAPH_Y_COORDINATE),
    );
  },

  normalizePosition: (position) => {
    return {
      x: get().normalizeCoordinate(position.x, 'x'),
      y: get().normalizeCoordinate(position.y, 'y'),
    };
  },

  setGraphRef: (ref) => {
    set({ graphRef: ref });
  },
  setGraphDimensions: () => {},
  setDataFromBase32: (base32) => {
    const base32Regex =
      /^h-[A-Z2-7]{8}(?:-[A-Z2-7]{16})*-[A-Z2-7]{8}-s-[A-Z2-7]{8}(?:-[A-Z2-7]{16})*-[A-Z2-7]{8}-l-[A-Z2-7]{8}(?:-[A-Z2-7]{16})*-[A-Z2-7]{8}-p*(?:-[A-Z2-7]{2})*$/;
    // TODO: Regexp accepts strings with -ppppppppppppp-

    if (!base32Regex.test(base32)) {
      console.error(`Invalid base32 string ${base32}`);
      return;
    }

    const pathSegments = base32.split(/h-|-s-|-l-|-p-/).slice(1);
    const paletteHslDictionary = ['hue', 'saturation', 'light'] as const;

    set({
      palette: pathSegments.reduce<Palette>((acc, pathSegment, i) => {
        const newAcc = { ...acc };
        const isGraphSegment = i < 3;

        if (isGraphSegment) {
          // Decode HSL Graph points
          const points = pathSegment.split('-');
          const decodedPoints = points.map(
            (point, j): Point =>
              decodeGraphPoint(
                point,
                j,
                points.length,
                paletteHslDictionary[i],
              ),
          );

          const segments = decodedPoints.reduce<Segment[]>(
            (segmentsAcc, point, j) => {
              if (!(j < decodedPoints.length - 1)) {
                return segmentsAcc;
              }

              const nextPoint = decodedPoints[j + 1];

              const segment = {
                startPointUuid: point.uuid,
                endPointUuid: nextPoint.uuid,
                curve: calculateBezierSegment(point, nextPoint).curve,
              };

              return [...segmentsAcc, segment];
            },
            [],
          );

          newAcc.graph[paletteHslDictionary[i]] = {
            segments: segments,
            points: decodedPoints,
          };
        } else {
          // Decode swatches
          const swatches = pathSegment.split('-');
          newAcc.swatches = swatches.map((swatch) => {
            return decodeSwatch(swatch);
          });
        }

        return newAcc;
      }, initialPalette),
    });
  },

  movePoint: (uuid, position) => {
    set((state) => {
      const normalizedPosition = get().normalizePosition(position);
      const colorMode = get().selectedColorMode;
      const prevPoints = state.palette.graph[colorMode].points;

      const point = prevPoints.find((prevPoint) => prevPoint.uuid === uuid);
      if (!point) {
        throw new Error('Point not found!');
      }

      /*
      Freeze the x position of the first and last point and limit
      the position of intermediate points from extending beyond the
      previous or next point
      */
      const pointIndex = prevPoints.findIndex(
        (prevPoint) => prevPoint.uuid === uuid,
      );
      if (pointIndex === 0) {
        normalizedPosition.x = MIN_GRAPH_X_COORDINATE;
      } else if (pointIndex === prevPoints.length - 1) {
        normalizedPosition.x = MAX_GRAPH_Y_COORDINATE;
      } else {
        normalizedPosition.x = Math.min(
          prevPoints[pointIndex + 1].position.x - POINT_MARGIN,
          Math.max(
            prevPoints[pointIndex - 1].position.x + POINT_MARGIN,
            normalizedPosition.x,
          ),
        );
      }

      /*
      Limit the y position to prevent the point from being dragged
      out of graph boundaries
      */
      normalizedPosition.y = Math.min(
        Math.max(normalizedPosition.y, MIN_GRAPH_Y_COORDINATE),
        MAX_GRAPH_Y_COORDINATE,
      );

      /*
      If an adjacent curve overlaps limit */
      if (pointIndex !== 0) {
        const segment = calculateBezierSegment(prevPoints[pointIndex - 1], {
          ...point,
          position: normalizedPosition,
          handles: adjustPointHandles(
            {
              ...point,
              position: get().normalizePosition(point.position),
            },
            normalizedPosition,
          ),
        }).curve;
      }

      // If the curve extends over the top/bottom boundary, limit the y
      return {
        palette: {
          ...state.palette,
          graph: {
            ...state.palette.graph,
            [colorMode]: {
              ...state.palette.graph[colorMode],
              points: prevPoints.map((prevPoint) => {
                if (prevPoint.uuid === point.uuid) {
                  return {
                    ...prevPoint,
                    position: normalizedPosition,
                    handles: adjustPointHandles(point, normalizedPosition),
                  };
                } else {
                  return prevPoint;
                }
              }),
            },
          },
        },
      };
    });
  },

  moveHandle: (point, newPosition, handleIndex) => {
    set((state) => {
      return {
        palette: {
          ...state.palette,
          graph: {
            ...state.palette.graph,
            [point.colorMode]: {
              ...state.palette.graph[point.colorMode],
              points: state.palette.graph[point.colorMode].points.map(
                (prevPoint) => {
                  if (prevPoint.uuid === point.uuid) {
                    return {
                      ...prevPoint,
                      handles: prevPoint.handles.map((handle, i) => {
                        if (i === handleIndex) {
                          return {
                            ...handle,
                            position: {
                              x: calculateStorePosition(
                                newPosition.x,
                                state.graphDimensions.width,
                              ),
                              y: calculateStorePosition(
                                newPosition.y,
                                state.graphDimensions.height,
                              ),
                            },
                          };
                        } else {
                          return handle;
                        }
                      }),
                    };
                  } else {
                    return prevPoint;
                  }
                },
              ),
            },
          },
        },
      };
    });
  },

  addPoint: (points, cursorPosition) => {
    set((state) => {
      const prevPointIndex = state.palette.graph[
        points[0].colorMode
      ].points.findIndex((prevPoint) => prevPoint.uuid === points[0].uuid);

      const newPointsArray = [
        ...state.palette.graph[points[0].colorMode].points,
      ];
      newPointsArray.splice(
        prevPointIndex + 1,
        0,
        calculateIntermediateBezierPoint(points, {
          x: calculateStorePosition(
            cursorPosition.x,
            state.graphDimensions.width,
          ),
          y: calculateStorePosition(
            cursorPosition.y,
            state.graphDimensions.height,
          ),
        }),
      );

      return {
        palette: {
          ...state.palette,
          graph: {
            ...state.palette.graph,
            [points[0].colorMode]: newPointsArray,
          },
        },
      };
    });
  },
  removePoint: () => {},
}));

export default usePaletteStore;
