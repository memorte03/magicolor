import { calculateHSLValue } from './calculateHSLValue';
import { Palette } from '@/types';

const drawQuadraticHSLGradient = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  colorMode: string, // either 'hue', 'saturation', or 'light'
  palette: Palette,
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
  for (let x = 0; x < width; x++) {
    // Calculate inactive HSL values.
    const h =
      colorMode === 'hue'
        ? null
        : calculateHSLValue(palette.graph.hue.points, x, width) * 3.6;
    const s =
      colorMode === 'saturation'
        ? null
        : calculateHSLValue(palette.graph.saturation.points, x, width);
    const l =
      colorMode === 'light'
        ? null
        : calculateHSLValue(palette.graph.light.points, x, width);

    // Create a gradient
    const grd = ctx.createLinearGradient(0, 0, 0, height);

    for (let y = 0; y < height; y++) {
      grd.addColorStop(
        y / height,
        `hsl(${h || (y / height) * 360}, ${s || (y / height) * 100}%, ${
          l || (y / height) * 100
        }%)`,
      );
    }

    // Draw the gradient
    ctx.fillStyle = grd;
    ctx.fillRect(x, 0, 1, height);
  }
};

export default drawQuadraticHSLGradient;
