import { v4 as uuidv4 } from 'uuid';

import calculateClosestBezierPoint from './calculateClosestBezierPoint';
import { Point, Position } from '@/types';

export default function calculateIntermediateBezierPoint(
  points: [Point, Point],
  cursorPosition: Position,
): Point {
  // Extracting points and their handles
  const [startPoint, endPoint] = points;
  // const startHandle =
  //   startPoint.handles.length > 1
  //     ? startPoint.handles[1]
  //     : startPoint.handles[0];
  // const endHandle = endPoint.handles[0];

  // Convert relative handle positions to absolute
  // const startHandleAbs = {
  //   x: startPoint.position.x + startHandle!.relativePosition.x,
  //   y: startPoint.position.y + startHandle!.relativePosition.y,
  // };
  // const endHandleAbs = {
  //   x: endPoint.position.x + endHandle!.relativePosition.x,
  //   y: endPoint.position.y + endHandle!.relativePosition.y,
  // };

  const [finalPointX, finalPointY] = calculateClosestBezierPoint(
    points,
    cursorPosition,
  );

  // Return the new point
  return {
    uuid: uuidv4(),
    position: {
      x: finalPointX,
      y: finalPointY,
    },
    handles: [
      {
        position: { x: 0, y: 0 },
      },
      {
        position: { x: 0, y: 0 },
      },
    ],
    colorMode: startPoint.colorMode,
  };
}

// import { v4 as uuidv4 } from 'uuid';

// import { Point, Position } from '@/types';

// export default function calculateIntermediateBezierPoint(
//   points: [Point, Point],
//   cursorPosition: Position,
// ): Point {
//   // Extracting points and their handles
//   const [startPoint, endPoint] = points;
//   const startHandle =
//     startPoint.handles.length > 1
//       ? startPoint.handles[1]
//       : startPoint.handles[0];
//   const endHandle = endPoint.handles[0];

//   // Convert relative handle positions to absolute
//   const startHandleAbs = {
//     x: startPoint.position.x + startHandle!.relativePosition.x,
//     y: startPoint.position.y + startHandle!.relativePosition.y,
//   };
//   const endHandleAbs = {
//     x: endPoint.position.x + endHandle!.relativePosition.x,
//     y: endPoint.position.y + endHandle!.relativePosition.y,
//   };

//   const [x , y] = calcu

//   // Cubic Bezier function for x and y
//   const bezier = (
//     t: number,
//     p0: number,
//     p1: number,
//     p2: number,
//     p3: number,
//   ) => {
//     const oneMinusT = 1 - t;
//     return (
//       Math.pow(oneMinusT, 3) * p0 +
//       3 * Math.pow(oneMinusT, 2) * t * p1 +
//       3 * oneMinusT * Math.pow(t, 2) * p2 +
//       Math.pow(t, 3) * p3
//     );
//   };

//   // Approximate t for given x
//   let t = 0.5,
//     tIncrement = 0.25;
//   for (let i = 0; i < 10; i++) {
//     // Iterative approach
//     const bezierX = bezier(
//       t,
//       startPoint.position.x,
//       startHandleAbs.x,
//       endHandleAbs.x,
//       endPoint.position.x,
//     );
//     if (Math.abs(bezierX - x) < 0.001) break; // Close enough
//     t += bezierX < x ? tIncrement : -tIncrement;
//     tIncrement /= 2;
//   }

//   // Now calculate y using the approximated t
//   const finalY = bezier(
//     t,
//     startPoint.position.y,
//     startHandleAbs.y,
//     endHandleAbs.y,
//     endPoint.position.y,
//   );

//   // Return the new point
//   return {
//     uuid: uuidv4(),
//     position: {
//       x: x,
//       y: finalY,
//     },
//     handles: [
//       {
//         relativePosition: { x: 0, y: 0 },
//       },
//       {
//         relativePosition: { x: 0, y: 0 },
//       },
//     ],
//     colorMode: startPoint.colorMode,
//   };
// }
