import { useShallow } from 'zustand/react/shallow';

import Curve from './Curve';
import usePaletteStore from '@/hooks/usePaletteStore';
import { ColorMode, Point } from '@/types';

import styles from './index.module.scss';

interface GraphCurvesProps {
  colorMode: ColorMode;
}

export default function GraphCurves({ colorMode }: GraphCurvesProps) {
  const [palette, graphDimensions] = usePaletteStore(
    useShallow((state) => [state.palette, state.graphDimensions]),
  );

  return (
    <svg
      className={styles['container']}
      viewBox={`0 0 ${graphDimensions.width} ${graphDimensions.height}`}
    >
      {palette.graph[colorMode].points.map((point, i) => {
        const nextPoint: Point | undefined =
          palette.graph[colorMode].points[i + 1];
        if (nextPoint) {
          return (
            <Curve
              colorMode={colorMode}
              key={`curve-${point.uuid}-${nextPoint.uuid}`}
              points={[point, nextPoint]}
            />
          );
        } else return false;
      })}
    </svg>
  );
}
