import { GameDifficulty } from '../entities';

export interface DifficultyConfig {
  rows: number;
  columns: number;
  bombDensity: number;
}

export const DIFFICULTY_CONFIGS: Record<
  GameDifficulty,
  DifficultyConfig | null
> = {
  [GameDifficulty.EASY]: {
    rows: parseInt(process.env.EASY_ROWS || '20', 10),
    columns: parseInt(process.env.EASY_COLUMNS || '20', 10),
    bombDensity: parseFloat(process.env.EASY_BOMB_DENSITY || '0.10'),
  },
  [GameDifficulty.NORMAL]: {
    rows: parseInt(process.env.NORMAL_ROWS || '40', 10),
    columns: parseInt(process.env.NORMAL_COLUMNS || '40', 10),
    bombDensity: parseFloat(process.env.NORMAL_BOMB_DENSITY || '0.15'),
  },
  [GameDifficulty.HARD]: {
    rows: parseInt(process.env.HARD_ROWS || '80', 10),
    columns: parseInt(process.env.HARD_COLUMNS || '80', 10),
    bombDensity: parseFloat(process.env.HARD_BOMB_DENSITY || '0.20'),
  },
  [GameDifficulty.CUSTOM]: null,
};

export function getDifficultyConfig(
  difficulty: GameDifficulty,
): DifficultyConfig | null {
  return DIFFICULTY_CONFIGS[difficulty];
}

export function detectDifficulty(
  rows: number,
  columns: number,
  bombDensity: number,
): GameDifficulty {
  for (const [difficultyKey, config] of Object.entries(DIFFICULTY_CONFIGS)) {
    if (
      config &&
      config.rows === rows &&
      config.columns === columns &&
      Math.abs(config.bombDensity - bombDensity) < 0.001
    ) {
      return difficultyKey as GameDifficulty;
    }
  }
  return GameDifficulty.CUSTOM;
}

export function getDefaultDifficulty(): GameDifficulty {
  const defaultDifficulty = process.env.DEFAULT_DIFFICULTY || 'NORMAL';
  return (defaultDifficulty as GameDifficulty) || GameDifficulty.NORMAL;
}
