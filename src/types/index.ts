import { COLOR_MODES } from '@/constants';

export type ColorMode = (typeof COLOR_MODES)[number];
export interface Position {
  x: number;
  y: number;
}

export interface Handle {
  relativePosition: Position;
}

export type PointHandles = [Handle, Handle] | [Handle];

export interface Point {
  uuid: string;
  position: Position;
  handles: PointHandles;
  colorMode: ColorMode;
}

export interface Swatch {
  point: number;
  hex?: string;
  hsl?: string;
}

export interface Palette {
  graph: {
    hue: Point[];
    saturation: Point[];
    light: Point[];
  };
  swatches: Swatch[];
}

export interface GraphDimensions {
  width: number;
  height: number;
}

// const initialPalette: Palette = {
//   graph: {
//     curves: {
//       hue: [
//         {
//           position: { x: 0, y: 30 },
//           handles: [
//             { relativePosition: { x: 0, y: 30 } },
//             { relativePosition: { x: 0, y: 40 } },
//           ],
//         },
//         {
//           position: { x: 100, y: 90 },
//           handles: [
//             { relativePosition: { x: 100, y: 30 } },
//             { relativePosition: { x: 100, y: 90 } },
//           ],
//         },
//       ],
//       saturation: [
//         {
//           position: { x: 0, y: 60 },
//           handles: [
//             { relativePosition: { x: 50, y: 50 } },
//             { relativePosition: { x: 30, y: 40 } },
//           ],
//         },
//         {
//           position: { x: 100, y: 90 },
//           handles: [
//             { relativePosition: { x: 100, y: 10 } },
//             { relativePosition: { x: 100, y: 10 } },
//           ],
//         },
//       ],
//       light: [
//         {
//           position: { x: 0, y: 20 },
//           handles: [
//             { relativePosition: { x: 0, y: 10 } },
//             { relativePosition: { x: 0, y: 5 } },
//           ],
//         },
//         {
//           position: { x: 100, y: 90 },
//           handles: [
//             { relativePosition: { x: 100, y: 10 } },
//             { relativePosition: { x: 100, y: 10 } },
//           ],
//         },
//       ],
//     },
//   },
// };

// interface PaletteState {
//   palette: Palette;
//   setPointPosition: (
//     colorMode: ColorMode,
//     pointIndex: number,
//     position: Position,
//   ) => void;
//   setHandlePosition: (
//     colorMode: ColorMode,
//     pointIndex: number,
//     handleIndex: number,
//     relativePosition: number,
//   ) => void;
// }

// const usePaletteStore = create<PaletteState>((set) => ({
//   palette: initialPalette,
//   setHandlePosition(colorMode, pointIndex, handleIndex, relativePosition) {},
//   setPointPosition(colorMode, pointIndex, newPosition) {
//     set((state) => {
//       if (!state.palette.graph.dimensions) {
//         console.error('Graph dimensions not found!');
//         return state;
//       }
//       const hasFixedX =
//         pointIndex === 0 ||
//         pointIndex === state.palette.graph.curves[colorMode].length - 1;

//       const prevPoint = state.palette.graph.curves[colorMode][pointIndex];

//       const clampedX = hasFixedX
//         ? prevPoint.position.x
//         : Math.max(
//             0,
//             Math.min(newPosition.x, state.palette.graph.dimensions.width),
//           );

//       const clampedY = Math.max(
//         0,
//         Math.min(newPosition.y, state.palette.graph.dimensions.height),
//       );

//       return state;
//     });
//   },
// }));
