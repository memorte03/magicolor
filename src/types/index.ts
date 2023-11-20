import { AXES, COLOR_MODES } from '@/constants';

export type ColorMode = (typeof COLOR_MODES)[number];
export type Axis = (typeof AXES)[number];
export interface Position {
  x: number;
  y: number;
}

export interface Handle {
  position: Position;
}

export type PointHandles = [Handle, Handle] | [Handle];

export interface Point {
  uuid: string;
  position: Position;
  handles: PointHandles;
  colorMode: ColorMode;
}

export interface Segment {
  startPointUuid: string;
  endPointUuid: string;
  curve: number[][];
}

export interface Swatch {
  point: number;
  hex?: string;
  hsl?: string;
}

export interface Palette {
  segments: Segment[];
  graph: {
    hue: {
      points: Point[];
      segments: Segment[];
    };
    saturation: {
      points: Point[];
      segments: Segment[];
    };
    light: {
      points: Point[];
      segments: Segment[];
    };
  };
  swatches: Swatch[];
}

export interface GraphDimensions {
  width: number;
  height: number;
}
