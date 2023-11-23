import { Segment } from '@/types';

export default function flattenSegments(segments: Segment[]): number[] {
  return segments.reduce<number[]>((acc, segment) => {
    return acc.concat(segment.curve);
  }, []);
}
