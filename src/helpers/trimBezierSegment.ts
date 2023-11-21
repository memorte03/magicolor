import { Segment } from '@/types';

export default function trimBezierSegment(
  startPosition: number,
  endPosition: number,
  segment: Segment,
): Segment {
  return {
    ...segment,
    curve: segment.curve.slice(startPosition, endPosition),
  };
}
