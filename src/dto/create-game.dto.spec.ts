import { validateWithYup } from '../utils';
import { createGameSchema, CreateGameDto } from './create-game.dto';
import { GameDifficulty } from '../entities';

describe('CreateGameDto Validation', () => {
  describe('Valid cases', () => {
    it('should allow empty DTO (default difficulty)', async () => {
      const dto: CreateGameDto = {};

      const result = await validateWithYup(createGameSchema, dto);

      expect(result).toEqual({});
    });

    it('should allow difficulty only', async () => {
      const dto: CreateGameDto = { difficulty: GameDifficulty.EASY };

      const result = await validateWithYup(createGameSchema, dto);

      expect(result.difficulty).toBe(GameDifficulty.EASY);
    });

    it('should allow both rows and columns', async () => {
      const dto: CreateGameDto = { rows: 10, columns: 15 };

      const result = await validateWithYup(createGameSchema, dto);

      expect(result.rows).toBe(10);
      expect(result.columns).toBe(15);
    });

    it('should allow rows only (defaults to square)', async () => {
      const dto: CreateGameDto = { rows: 12 };

      const result = await validateWithYup(createGameSchema, dto);

      expect(result.rows).toBe(12);
      expect(result.columns).toBeUndefined(); // DTO validation doesn't fill in defaults
    });

    it('should allow columns only (defaults to square)', async () => {
      const dto: CreateGameDto = { columns: 18 };

      const result = await validateWithYup(createGameSchema, dto);

      expect(result.columns).toBe(18);
      expect(result.rows).toBeUndefined(); // DTO validation doesn't fill in defaults
    });

    it('should allow rows with bombDensity', async () => {
      const dto: CreateGameDto = { rows: 15, bombDensity: 0.2 };

      const result = await validateWithYup(createGameSchema, dto);

      expect(result.rows).toBe(15);
      expect(result.bombDensity).toBe(0.2);
    });

    it('should allow columns with bombDensity', async () => {
      const dto: CreateGameDto = { columns: 20, bombDensity: 0.3 };

      const result = await validateWithYup(createGameSchema, dto);

      expect(result.columns).toBe(20);
      expect(result.bombDensity).toBe(0.3);
    });
  });

  describe('Invalid cases', () => {
    it('should reject difficulty with custom parameters', async () => {
      const dto: CreateGameDto = {
        difficulty: GameDifficulty.NORMAL,
        rows: 10,
      };

      await expect(validateWithYup(createGameSchema, dto)).rejects.toThrow(
        'Validation failed',
      );
    });

    it('should reject difficulty with bombDensity', async () => {
      const dto: CreateGameDto = {
        difficulty: GameDifficulty.EASY,
        bombDensity: 0.2,
      };

      await expect(validateWithYup(createGameSchema, dto)).rejects.toThrow(
        'Validation failed',
      );
    });

    it('should reject rows below minimum', async () => {
      const dto: CreateGameDto = { rows: 3 };

      await expect(validateWithYup(createGameSchema, dto)).rejects.toThrow(
        'Validation failed',
      );
    });

    it('should reject columns above maximum', async () => {
      const dto: CreateGameDto = { columns: 150 };

      await expect(validateWithYup(createGameSchema, dto)).rejects.toThrow(
        'Validation failed',
      );
    });

    it('should reject invalid bombDensity', async () => {
      const dto: CreateGameDto = { rows: 10, bombDensity: 0.9 };

      await expect(validateWithYup(createGameSchema, dto)).rejects.toThrow(
        'Validation failed',
      );
    });
  });
});
