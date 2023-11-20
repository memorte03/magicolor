import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

import drawCurvePoints from '@/helpers/drawCurvePoints';
import drawQuadraticHSLGradient from '@/helpers/drawQuadraticHLSGradient';
import usePaletteStore from '@/hooks/usePaletteStore';
import { ColorMode } from '@/types';

import styles from './index.module.scss';

interface GraphGradientProps {
  colorMode: ColorMode;
}

export default function GraphGradient({ colorMode }: GraphGradientProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  const [palette, graphDimensions] = usePaletteStore(
    useShallow((state) => [state.palette, state.graphDimensions]),
  );

  useEffect(() => {
    drawQuadraticHSLGradient(ref, colorMode, palette);
    drawCurvePoints(ref, colorMode, palette);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorMode]);

  return (
    <canvas
      className={styles['canvas']}
      height={graphDimensions.height}
      ref={ref}
      width={graphDimensions.width}
    />
  );
}
