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
  handle: { position },
  index,
}: HandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 });
  const moveHandle = usePaletteStore((state) => state.moveHandle);

  const style = {
    top: `${Math.min(position.y, 0)}px`,
    left: `${Math.min(position.x, 0)}px`,
  };

  const horizontalStartPosition = position.x < 0 ? Math.abs(position.x) : 0;
  const horizontalEndPosition = position.x >= 0 ? position.x : 0;

  const verticalStartPosition = position.y < 0 ? Math.abs(position.y) : 0;
  const verticalEndPosition = position.y >= 0 ? position.y : 0;

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return; // Only respond to left clicks
      e.preventDefault(); // Prevent default behavior
      setIsDragging(true);
      setStartDragPosition({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    },
    [position],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      console.log(e.clientX);
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
  }, [isDragging, startDragPosition, position, index, moveHandle, point]);

  return (
    <>
      <div
        className={styles['handle']}
        onMouseDown={onMouseDown}
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
        }}
      />
      <svg
        className={styles['handle-line']}
        fill="none"
        height={Math.abs(position.y)}
        style={style}
        viewBox={`0 0 ${Math.abs(position.x)} ${Math.abs(position.y)}`}
        width={Math.abs(position.x)}
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
