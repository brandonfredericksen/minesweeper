import * as yup from 'yup';
import { GameDifficulty } from '../entities';

export const createGameSchema = yup
  .object({
    difficulty: yup
      .string()
      .oneOf(Object.values(GameDifficulty), 'Invalid difficulty level'),
    rows: yup
      .number()
      .min(5, 'Minimum rows is 5')
      .max(100, 'Maximum rows is 100')
      .integer('Rows must be an integer'),
    columns: yup
      .number()
      .min(5, 'Minimum columns is 5')
      .max(100, 'Maximum columns is 100')
      .integer('Columns must be an integer'),
    bombDensity: yup
      .number()
      .min(0.01, 'Minimum bomb density is 0.01')
      .max(0.8, 'Maximum bomb density is 0.8'),
  })
  .test('difficulty-or-custom', 'Invalid game parameters', function (value) {
    const { difficulty, rows, columns, bombDensity } = value;

    // Case 1: Nothing specified (valid - will use default difficulty)
    if (!difficulty && !rows && !columns && bombDensity === undefined) {
      return true;
    }

    // Case 2: Difficulty specified alone (valid)
    if (difficulty && !rows && !columns && bombDensity === undefined) {
      return true;
    }

    // Case 3: Custom parameters without difficulty (valid)
    if (!difficulty && rows && columns) {
      return true;
    }

    // Case 4: Difficulty with any other parameters (invalid)
    if (difficulty && (rows || columns || bombDensity !== undefined)) {
      return this.createError({
        message:
          'Cannot specify difficulty with custom parameters. Use difficulty alone or specify rows/columns for custom game.',
      });
    }

    // Case 5: Incomplete custom parameters
    if (!difficulty && (rows || columns || bombDensity !== undefined)) {
      if (!rows || !columns) {
        return this.createError({
          message: 'Must specify both rows and columns for custom game',
        });
      }
    }

    return true;
  });

export interface CreateGameDto {
  difficulty?: GameDifficulty;
  rows?: number;
  columns?: number;
  bombDensity?: number;
}
