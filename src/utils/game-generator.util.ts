import { CellStatus } from '../entities';

export interface CellData {
  xCoordinate: number;
  yCoordinate: number;
  isMine: boolean;
  neighboringBombCount: number;
  status: CellStatus;
}

export interface GameBoard {
  rows: number;
  columns: number;
  bombDensity: number;
  cells: CellData[];
}

export function generateGameBoard(
  rows: number,
  columns: number,
  bombDensity: number,
): GameBoard {
  const totalCells = rows * columns;
  const totalMines = Math.floor(totalCells * bombDensity);

  const cells: CellData[] = [];

  // Initialize all cells
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      cells.push({
        xCoordinate: x,
        yCoordinate: y,
        isMine: false,
        neighboringBombCount: 0,
        status: CellStatus.Hidden,
      });
    }
  }

  // Place mines randomly
  const minePositions = generateRandomMinePositions(totalCells, totalMines);
  minePositions.forEach((position) => {
    cells[position].isMine = true;
  });

  // Calculate neighboring bomb counts
  cells.forEach((cell) => {
    if (!cell.isMine) {
      cell.neighboringBombCount = calculateNeighboringBombs(
        cell.xCoordinate,
        cell.yCoordinate,
        rows,
        columns,
        cells,
      );
    }
  });

  return {
    rows,
    columns,
    bombDensity,
    cells,
  };
}

function generateRandomMinePositions(
  totalCells: number,
  totalMines: number,
): number[] {
  const positions: number[] = [];
  const availablePositions = Array.from({ length: totalCells }, (_, i) => i);

  for (let i = 0; i < totalMines; i++) {
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    positions.push(availablePositions[randomIndex]);
    availablePositions.splice(randomIndex, 1);
  }

  return positions;
}

function calculateNeighboringBombs(
  currentCellX: number,
  currentCellY: number,
  boardRows: number,
  boardColumns: number,
  gameCells: CellData[],
): number {
  let neighboringBombCount = 0;

  // Check all 8 surrounding cells (3x3 grid minus the center cell)
  for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset++) {
      // Skip the current cell itself (center of the 3x3 grid)
      if (columnOffset === 0 && rowOffset === 0) continue;

      const neighborX = currentCellX + columnOffset;
      const neighborY = currentCellY + rowOffset;

      // Check if the neighbor coordinates are within board bounds
      const isWithinHorizontalBounds =
        neighborX >= 0 && neighborX < boardColumns;
      const isWithinVerticalBounds = neighborY >= 0 && neighborY < boardRows;

      if (isWithinHorizontalBounds && isWithinVerticalBounds) {
        const neighborCellIndex = neighborY * boardColumns + neighborX;
        if (gameCells[neighborCellIndex].isMine) {
          neighboringBombCount++;
        }
      }
    }
  }

  return neighboringBombCount;
}
