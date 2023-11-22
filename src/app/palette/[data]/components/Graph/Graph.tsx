import { useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import Point from '../Point';

import GraphCurves from './GraphCurves';
import GraphGradient from './GraphGradient';
import {
  decodeBase32Value,
  encodeBase32Value,
  encodePathFromPalette,
} from '@/helpers/base32';
import { benchmarkBezier } from '@/helpers/calculateBezierSegment';
import { calculateGraphPoints } from '@/helpers/calculateGraphPoints';
import usePaletteStore from '@/hooks/usePaletteStore';
import { ColorMode } from '@/types';

import styles from './index.module.scss';

interface GraphProps {
  colorMode: ColorMode;
}

export default function Graph({ colorMode }: GraphProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
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
    () =>
      calculateGraphPoints(palette.graph[colorMode].points, graphDimensions),
    [palette, graphDimensions, colorMode],
  );

  useEffect(() => {
    setGraphRef(ref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    benchmarkBezier(points[0], points[1]);
    console.log(encodePathFromPalette(palette));
    console.log(decodeBase32Value(encodeBase32Value(253)));
  };
  // TODO: SET GRAPH DIMENSIONS!
  // TODO: REMOVE
  const handleMouseMove = (e: MouseEvent) => {
    const graphBoundingRect = ref.current?.getBoundingClientRect();

    if (graphBoundingRect) {
      setDebugInfo(
        `x: ${e.pageX - graphBoundingRect.x}, y: ${
          (e.pageY - graphBoundingRect.y) * 2
        }`,
      );
    }
  };

  return (
    <>
      <button onClick={handleClick} type="button">
        Click me
      </button>
      <div className={styles['graph']} onMouseMove={handleMouseMove} ref={ref}>
        {points.map((point) => (
          <>
            <Point {...point} key={`${colorMode}-point-${point.uuid}`} />
          </>
        ))}
        <GraphGradient colorMode={colorMode} />
        <GraphCurves colorMode={colorMode} />
      </div>
      {debugInfo}
    </>
  );
}
