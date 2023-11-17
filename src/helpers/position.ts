export function calculateStorePosition(
  positionCoordinate: number,
  graphDimension: number,
) {
  return Math.floor((positionCoordinate / graphDimension) * 1024);
}

export function calculateGraphPosition(
  positionCoordinate: number,
  graphDimension: number,
) {
  return Math.floor((positionCoordinate / 1024) * graphDimension);
}
