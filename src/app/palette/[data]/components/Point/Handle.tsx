import { useCallback, useEffect, useState } from 'react';

import usePaletteStore from '@/hooks/usePaletteStore';
import { Handle as HandleT, Point } from '@/types';

import styles from './index.module.scss';

interface HandleProps {
  point: Point;
  handle: HandleT;
  index: number;
}

export default function Handle({
  point,
  handle: { relativePosition },
  index,
}: HandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 });
  const moveHandle = usePaletteStore((state) => state.moveHandle);

  const style = {
    top: `${Math.min(relativePosition.y, 0)}px`,
    left: `${Math.min(relativePosition.x, 0)}px`,
  };

  const horizontalStartPosition =
    relativePosition.x < 0 ? Math.abs(relativePosition.x) : 0;
  const horizontalEndPosition =
    relativePosition.x >= 0 ? relativePosition.x : 0;

  const verticalStartPosition =
    relativePosition.y < 0 ? Math.abs(relativePosition.y) : 0;
  const verticalEndPosition = relativePosition.y >= 0 ? relativePosition.y : 0;

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return; // Only respond to left clicks
      e.preventDefault(); // Prevent default behavior
      setIsDragging(true);
      setStartDragPosition({
        x: e.clientX - relativePosition.x,
        y: e.clientY - relativePosition.y,
      });
    },
    [relativePosition],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      moveHandle(
        point,
        {
          x: e.clientX - startDragPosition.x,
          y: e.clientY - startDragPosition.y,
        },
        index,
      );
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [
    isDragging,
    startDragPosition,
    relativePosition,
    index,
    moveHandle,
    point,
  ]);

  return (
    <>
      <div
        className={styles['handle']}
        onMouseDown={onMouseDown}
        style={{
          top: `${relativePosition.y}px`,
          left: `${relativePosition.x}px`,
        }}
      />
      <svg
        className={styles['handle-line']}
        fill="none"
        height={Math.abs(relativePosition.y)}
        style={style}
        viewBox={`0 0 ${Math.abs(relativePosition.x)} ${Math.abs(
          relativePosition.y,
        )}`}
        width={Math.abs(relativePosition.x)}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className={styles['handle-line__path']}
          d={`M ${horizontalStartPosition} ${verticalStartPosition} L ${horizontalEndPosition} ${verticalEndPosition}`}
        />
      </svg>
    </>
  );
}
