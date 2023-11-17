import { useEffect, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

import Point from '../Point';

import GraphCurves from './GraphCurves';
import { calculateGraphPoints } from '@/helpers/calculateGraphPoints';
import usePaletteStore from '@/hooks/usePaletteStore';
import { ColorMode } from '@/types';

import styles from './index.module.scss';

interface GraphProps {
  colorMode: ColorMode;
}

export default function Graph({ colorMode }: GraphProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [palette, graphDimensions, setGraphRef, setGraphDimensions] =
    usePaletteStore(
      useShallow((state) => [
        state.palette,
        state.graphDimensions,
        state.setGraphRef,
        state.setGraphDimensions,
      ]),
    );

  const points = useMemo(
    () => calculateGraphPoints(palette.graph[colorMode], graphDimensions),
    [palette, graphDimensions, colorMode],
  );

  useEffect(() => {
    setGraphRef(ref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TODO: SET GRAPH DIMENSIONS!

  return (
    <div className={styles['graph']} ref={ref}>
      {points.map((point) => (
        <>
          <Point {...point} key={`${colorMode}-point-${point.uuid}`} />
        </>
      ))}
      <GraphCurves colorMode={colorMode} />
    </div>
  );
}
