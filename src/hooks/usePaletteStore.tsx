import { RefObject } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

import { decodeGraphPoint, decodeSwatch } from '@/helpers/base32';
import calculateIntermediateBezierPoint from '@/helpers/calculateIntermediateBezierPoint';
import { calculateStorePosition } from '@/helpers/position';
import { GraphDimensions, Palette, Point, Position } from '@/types';

const initialGraphRef: RefObject<HTMLDivElement> | null = null;

export const initialPalette: Palette = {
  graph: {
    hue: [
      {
        uuid: uuidv4(),
        colorMode: 'hue',
        position: {
          x: 0,
          y: 256,
        },
        handles: [
          {
            relativePosition: {
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
            relativePosition: {
              x: -20,
              y: 200,
            },
          },
        ],
      },
    ],
    light: [
      {
        uuid: uuidv4(),
        colorMode: 'light',
        position: {
          x: 0,
          y: 256,
        },
        handles: [
          {
            relativePosition: {
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
            relativePosition: {
              x: -20,
              y: 200,
            },
          },
        ],
      },
    ],
    saturation: [
      {
        uuid: uuidv4(),
        colorMode: 'saturation',
        position: {
          x: 0,
          y: 256,
        },
        handles: [
          {
            relativePosition: {
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
            relativePosition: {
              x: -20,
              y: 200,
            },
          },
        ],
      },
    ],
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
  setGraphRef: (ref: RefObject<HTMLDivElement>) => void;
  setDataFromBase32: (base32: string) => void;
  setGraphDimensions: () => void;

  movePoint: (point: Point, newPosition: Position) => void;
  addPoint: (points: [Point, Point], x: number) => void;
  removePoint: () => void;

  moveHandle: (
    point: Point,
    newPosition: Position,
    handleIndex: number,
  ) => void;
}

const usePaletteStore = create<PaletteState>((set) => ({
  palette: initialPalette,
  graphDimensions: initialGraphDimensions,
  graphRef: initialGraphRef,

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

    const segments = base32.split(/h-|-s-|-l-|-p-/).slice(1);
    const paletteHslDictionary = ['hue', 'saturation', 'light'] as const;

    set({
      palette: segments.reduce<Palette>((acc, segment, i) => {
        const newAcc = { ...acc };
        const isGraphSegment = i < 3;

        if (isGraphSegment) {
          // Decode HSL Graph points
          const points = segment.split('-');
          newAcc.graph[paletteHslDictionary[i]] = points.map(
            (point, j): Point =>
              decodeGraphPoint(
                point,
                j,
                points.length,
                paletteHslDictionary[i],
              ),
          );
        } else {
          // Decode swatches
          const swatches = segment.split('-');
          newAcc.swatches = swatches.map((swatch) => {
            return decodeSwatch(swatch);
          });
        }

        return newAcc;
      }, initialPalette),
    });
  },

  movePoint: (point, newPosition) => {
    set((state) => {
      return {
        palette: {
          ...state.palette,
          graph: {
            ...state.palette.graph,
            [point.colorMode]: state.palette.graph[point.colorMode].map(
              (prevPoint) => {
                if (prevPoint.uuid === point.uuid) {
                  return {
                    ...prevPoint,
                    position: {
                      x: Math.min(
                        1024,
                        Math.max(
                          0,
                          calculateStorePosition(
                            newPosition.x,
                            state.graphDimensions.width,
                          ),
                        ),
                      ),
                      y: Math.min(
                        1024,
                        Math.max(
                          0,
                          calculateStorePosition(
                            newPosition.y,
                            state.graphDimensions.height,
                          ),
                        ),
                      ),
                    },
                  };
                } else {
                  return prevPoint;
                }
              },
            ),
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
            [point.colorMode]: state.palette.graph[point.colorMode].map(
              (prevPoint) => {
                if (prevPoint.uuid === point.uuid) {
                  return {
                    ...prevPoint,
                    handles: prevPoint.handles.map((handle, i) => {
                      if (i === handleIndex) {
                        return {
                          ...handle,
                          relativePosition: {
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
      };
    });
  },

  addPoint: (points, x) => {
    set((state) => {
      const prevPointIndex = state.palette.graph[points[0].colorMode].findIndex(
        (prevPoint) => prevPoint.uuid === points[0].uuid,
      );

      const newPointsArray = [...state.palette.graph[points[0].colorMode]];
      newPointsArray.splice(
        prevPointIndex + 1,
        0,
        calculateIntermediateBezierPoint(
          points,
          calculateStorePosition(x, state.graphDimensions.width),
        ),
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
