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
  x: number,
  y: number,
  rows: number,
  columns: number,
  cells: CellData[],
): number {
  let count = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;

      const newX = x + dx;
      const newY = y + dy;

      if (newX >= 0 && newX < columns && newY >= 0 && newY < rows) {
        const cellIndex = newY * columns + newX;
        if (cells[cellIndex].isMine) {
          count++;
        }
      }
    }
  }

  return count;
}
