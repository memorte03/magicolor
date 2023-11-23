import { AXES, COLOR_MODES } from '@/constants';

export type ColorMode = (typeof COLOR_MODES)[number];
export type Axis = (typeof AXES)[number];
export type Position = {
  x: number;
  y: number;
};

export type Handle = {
  position: Position;
};

export type PointHandles = [Handle, Handle] | [Handle];

export type Point = {
  uuid: string;
  position: Position;
  handles: PointHandles;
  colorMode: ColorMode;
};

export type Segment = {
  startPointUuid: string;
  endPointUuid: string;
  curve: number[];
};

export type Swatch = {
  point: number;
  hex?: string;
  hsl?: string;
};

export type Graph = {
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

export type Palette = {
  graph: Graph;
  swatches: Swatch[];
};

export type GraphDimensions = {
  width: number;
  height: number;
};
