import * as yup from 'yup';
import { GameStatus, GameDifficulty } from '../entities';

export const getGamesQuerySchema = yup.object({
  page: yup
    .number()
    .min(1, 'Page must be at least 1')
    .integer('Page must be an integer')
    .default(1),
  limit: yup
    .number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .integer('Limit must be an integer')
    .default(10),
  status: yup
    .string()
    .oneOf(Object.values(GameStatus), 'Invalid status')
    .optional(),
  difficulty: yup
    .string()
    .oneOf(Object.values(GameDifficulty), 'Invalid difficulty')
    .optional(),
});

export interface GetGamesQueryDto {
  page?: number;
  limit?: number;
  status?: GameStatus;
  difficulty?: GameDifficulty;
}
