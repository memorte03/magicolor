import { MAX_GRAPH_Y_COORDINATE } from '@/constants';
import { ColorMode, Palette, Segment } from '@/types';

const drawQuadraticHSLGradient = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  colorMode: ColorMode, // either 'hue', 'saturation', or 'light'
  { graph }: Palette,

  // selectedPoint: number // index of the point being modified
) => {
  if (!canvasRef.current) return;
  const ctx = canvasRef.current.getContext('2d');
  if (!ctx) return;

  const width = canvasRef.current.width;
  const height = canvasRef.current.height;

  ctx.clearRect(0, 0, width, height); // Clear canvas

  // TODO: Potential optimization
  // Draw each x-position on the gradient.

  const flattenSegments = (segments: Segment[]): number[] => {
    return segments.reduce<number[]>((acc, segment) => {
      return acc.concat(segment.curve);
    }, []);
  };

  const hueValues = flattenSegments(graph.hue.segments);
  const saturationValues = flattenSegments(graph.saturation.segments);
  const lightValues = flattenSegments(graph.light.segments);

  for (let x = 0; x < width; x += 4) {
    // Calculate inactive HSL values.
    const h =
      colorMode === 'hue'
        ? null
        : (hueValues[x] / MAX_GRAPH_Y_COORDINATE) * 360;
    const s =
      colorMode === 'saturation'
        ? null
        : (saturationValues[x] / MAX_GRAPH_Y_COORDINATE) * 100;
    const l =
      colorMode === 'light'
        ? null
        : (lightValues[x] / MAX_GRAPH_Y_COORDINATE) * 100;

    // Create a gradient
    const grd = ctx.createLinearGradient(0, 0, 0, height);

    for (let y = 0; y < height; y += 4) {
      const deltaY = y / height;
      grd.addColorStop(
        deltaY,
        `hsl(${h || deltaY * 360}, ${s || deltaY * 100}%, ${
          l || deltaY * 100
        }%)`,
      );
    }

    // Draw the gradient
    ctx.fillStyle = grd;
    ctx.fillRect(x, 0, 4, height);
  }
};

export default drawQuadraticHSLGradient;
