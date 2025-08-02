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
  .test(
    'difficulty-or-custom',
    'Either provide difficulty OR custom parameters (rows, columns, bombDensity)',
    function (value) {
      const { difficulty, rows, columns, bombDensity } = value;

      if (difficulty && (rows || columns || bombDensity)) {
        return this.createError({
          message: 'Cannot specify both difficulty and custom parameters',
        });
      }

      if (!difficulty && (!rows || !columns || bombDensity === undefined)) {
        return this.createError({
          message:
            'Must specify either difficulty or all custom parameters (rows, columns, bombDensity)',
        });
      }

      return true;
    },
  );

export interface CreateGameDto {
  difficulty?: GameDifficulty;
  rows?: number;
  columns?: number;
  bombDensity?: number;
}
