import { useShallow } from 'zustand/react/shallow';

import calculateGraphPoint from '@/helpers/calculateGraphPoint';
import usePaletteStore from '@/hooks/usePaletteStore';
import { ColorMode, Point } from '@/types';

import styles from './index.module.scss';

interface CurveProps {
  points: [Point, Point];
  colorMode: ColorMode;
}

export default function Curve({ points, colorMode }: CurveProps) {
  const [graphDimensions, addPoint, graphRef] = usePaletteStore(
    useShallow((state) => [
      state.graphDimensions,
      state.addPoint,
      state.graphRef,
    ]),
  );
  const pointsCoordinates = points.map((point) =>
    calculateGraphPoint(point, graphDimensions),
  );

  const handleAddPoint = (
    e: React.MouseEvent<HTMLOrSVGElement, MouseEvent>,
  ) => {
    const graphXPosition = graphRef?.current?.getBoundingClientRect().x;
    const graphYPosition = graphRef?.current?.getBoundingClientRect().y;

    if (graphXPosition && graphYPosition) {
      addPoint(points, {
        x: e.clientX - graphXPosition,
        y: e.clientY - graphYPosition,
      });
    }
  };

  const pathCommand = `M ${pointsCoordinates[0].x} ${
    pointsCoordinates[0].y
  } C ${
    pointsCoordinates[0].handles[pointsCoordinates[0].handles.length - 1].x
  } ${
    pointsCoordinates[0].handles[pointsCoordinates[0].handles.length - 1].y
  } ${pointsCoordinates[1].handles[0].x} ${pointsCoordinates[1].handles[0].y} ${
    pointsCoordinates[1].x
  } ${pointsCoordinates[1].y}
`;
  return (
    <g className={styles['curve']} onClick={handleAddPoint}>
      <path className={styles['curve__outer']} d={pathCommand} />
      <path className={styles['curve__inner']} d={pathCommand} />
      <path className={styles['curve__hover-padding']} d={pathCommand} />
    </g>
  );
}
