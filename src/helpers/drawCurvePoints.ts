import flattenSegments from './flattenSegments';
import { ColorMode, Palette } from '@/types';

function drawDot(x: number, y: number, ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, 2 * Math.PI, true);
  ctx.fillStyle = '#FF0000';
  ctx.fill();
}

export default function drawCurvePoints(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  colorMode: ColorMode, // either 'hue', 'saturation', or 'light'
  palette: Palette,
) {
  if (!canvasRef.current) return;
  const ctx = canvasRef.current.getContext('2d');
  if (!ctx) return;

  flattenSegments(palette.graph[colorMode].segments).forEach((y, i) => {
    drawDot(i, y / 2, ctx);
  });
}
