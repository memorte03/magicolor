import { calculateHSLValue } from './calculateHSLValue';
import { Point } from '@/types';

const drawLinearHSLGradient = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  huePoints: Point[],
  satPoints: Point[],
  lightPoints: Point[],
) => {
  if (!canvasRef.current) return;
  const ctx = canvasRef.current.getContext('2d');
  if (!ctx) return;

  const width = canvasRef.current.width;
  const height = canvasRef.current.height;
  ctx.clearRect(0, 0, width, height); // Clear canvas

  // Iterate through each x-position on the gradient.
  for (let x = 0; x < width; x++) {
    // Calculate HSL at this x
    const h = calculateHSLValue(huePoints, x, width) * 3.6;
    const s = calculateHSLValue(satPoints, x, width);
    const l = calculateHSLValue(lightPoints, x, width);

    // Set the computed color and draw
    ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
    ctx.fillRect(x, 0, 1, height);
  }
};

export default drawLinearHSLGradient;
