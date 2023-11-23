import { RefObject } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

import { Bezier } from '@/classes';
import {
  MAX_GRAPH_X_COORDINATE,
  MAX_GRAPH_Y_COORDINATE,
  MIN_GRAPH_Y_COORDINATE,
} from '@/constants';
import { decodePaletteFromPath, testBase32 } from '@/helpers';
import adjustPointHandles from '@/helpers/adjustPointHandles';
import calculateIntermediateBezierPoint from '@/helpers/calculateIntermediateBezierPoint';
import { calculateStorePosition } from '@/helpers/position';
import {
  Axis,
  ColorMode,
  GraphDimensions,
  Palette,
  Point,
  Position,
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
  colorMode: ColorMode;

  // Helpers
  normalizeCoordinate: (coordinate: number, axis: Axis) => number;
  normalizePosition: (position: Position) => Position;

  setGraphRef: (ref: RefObject<HTMLDivElement>) => void;
  setDataFromBase32: (base32: string) => void;
  setGraphDimensions: () => void;
  setColorMode: (colorMode: ColorMode) => void;

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
  colorMode: 'hue',

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
    const isBase32Valid = testBase32(base32);
    if (!isBase32Valid) {
      console.error(`Invalid base32 string ${base32}`);
      return;
    }
    set({ palette: decodePaletteFromPath(base32) });
  },

  setColorMode: (colorMode) => {
    set({ colorMode: colorMode });
  },

  movePoint: (uuid, position) => {
    set((state) => {
      const normalizedPosition = get().normalizePosition(position);
      const colorMode = get().colorMode;
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
      // if (pointIndex === 0) {
      //   normalizedPosition.x = MIN_GRAPH_X_COORDINATE;
      // } else if (pointIndex === prevPoints.length - 1) {
      //   normalizedPosition.x = MAX_GRAPH_Y_COORDINATE;
      // } else {
      //   normalizedPosition.x = Math.min(
      //     prevPoints[pointIndex + 1].position.x - POINT_MARGIN,
      //     Math.max(
      //       prevPoints[pointIndex - 1].position.x + POINT_MARGIN,
      //       normalizedPosition.x,
      //     ),
      //   );
      // }

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
        const bezier = new Bezier([
          prevPoints[pointIndex - 1],
          {
            ...point,
            position: normalizedPosition,
            handles: adjustPointHandles(point, normalizedPosition),
          },
        ]);

        const getFinalCoord = (coord: number, min: number, max: number) => {
          if (min !== coord) return min;
          if (max !== coord) return max;
          return coord;
        };

        const maxX = bezier.getBoundMaxX('p3', point.position);
        const minX = bezier.getBoundMinX('p3', point.position);
        const maxY = bezier.getBoundMaxY('p3', point.position);
        const minY = bezier.getBoundMinY('p3', point.position);
        console.log(maxX, minX, maxY, minY);

        normalizedPosition.x = getFinalCoord(normalizedPosition.x, minX, maxX);
        normalizedPosition.y = getFinalCoord(normalizedPosition.y, minY, maxY);
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
