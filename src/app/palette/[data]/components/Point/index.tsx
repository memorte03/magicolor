import { useCallback, useEffect, useState } from 'react';

import Handle from './Handle';
import usePaletteStore from '@/hooks/usePaletteStore';
import { Point as PointT } from '@/types';

import styles from './index.module.scss';

interface PointProps extends PointT {}
interface PathProps {
  points: [PointT, PointT];
}

export default function Point({
  position,
  handles,
  uuid,
  ...restProps
}: PointProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 });
  const movePoint = usePaletteStore((state) => state.movePoint);

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
      movePoint(uuid, {
        x: e.clientX - startDragPosition.x,
        y: e.clientY - startDragPosition.y,
      });
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
    movePoint,
    handles,
    uuid,
    restProps,
    position,
  ]);

  return (
    <>
      <div
        className={styles['point']}
        style={{ top: position.y + 'px', left: position.x + 'px' }}
      >
        <div className={styles['point-circle']} onMouseDown={onMouseDown} />
      </div>
      {handles.map((handle, i) => (
        <Handle
          handle={handle}
          index={i}
          key={`hue-point-handle-${uuid}-${i}`}
          point={{
            position: position,
            handles: handles,
            uuid: uuid,
            ...restProps,
          }}
        />
      ))}
    </>
  );
}
