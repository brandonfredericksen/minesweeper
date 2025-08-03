import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GamesService } from './games.service';
import { CacheService } from './cache.service';
import { RateLimitService } from './rate-limit.service';
import { Game, GameCell, GameDifficulty } from '../entities';
import { CreateGameDto } from '../dto';

describe('GamesService', () => {
  let service: GamesService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockRepository = {
      createQueryBuilder: jest.fn(),
      manager: {
        connection: {
          createQueryRunner: jest.fn(() => ({
            connect: jest.fn(),
            startTransaction: jest.fn(),
            manager: {
              create: jest.fn(),
              save: jest.fn(),
            },
            commitTransaction: jest.fn(),
            rollbackTransaction: jest.fn(),
            release: jest.fn(),
          })),
        },
      },
    };

    const mockCacheService = {
      invalidateUserGamesCache: jest.fn(),
      setSingleGame: jest.fn(),
    };

    const mockRateLimitService = {
      incrementDailyGameCount: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('NORMAL'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        {
          provide: getRepositoryToken(Game),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(GameCell),
          useValue: mockRepository,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: RateLimitService,
          useValue: mockRateLimitService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
    configService = module.get(ConfigService);
  });

  describe('determineGameConfiguration', () => {
    it('should default to square grid when only rows specified', () => {
      const createGameDto: CreateGameDto = { rows: 15 };

      // Use type assertion to access private method for testing
      const config = (service as any).determineGameConfiguration(createGameDto);

      expect(config.rows).toBe(15);
      expect(config.columns).toBe(15); // defaults to square
      expect(config.bombDensity).toBe(0.15);
    });

    it('should default to square grid when only columns specified', () => {
      const createGameDto: CreateGameDto = { columns: 20 };

      const config = (service as any).determineGameConfiguration(createGameDto);

      expect(config.rows).toBe(20); // defaults to square
      expect(config.columns).toBe(20);
      expect(config.bombDensity).toBe(0.15);
    });

    it('should allow non-square grids when both dimensions specified', () => {
      const createGameDto: CreateGameDto = { rows: 10, columns: 15 };

      const config = (service as any).determineGameConfiguration(createGameDto);

      expect(config.rows).toBe(10);
      expect(config.columns).toBe(15); // non-square is allowed
      expect(config.bombDensity).toBe(0.15);
    });

    it('should use custom bomb density when specified', () => {
      const createGameDto: CreateGameDto = { rows: 12, bombDensity: 0.25 };

      const config = (service as any).determineGameConfiguration(createGameDto);

      expect(config.rows).toBe(12);
      expect(config.columns).toBe(12);
      expect(config.bombDensity).toBe(0.25);
    });

    it('should use difficulty-based config when difficulty specified', () => {
      const createGameDto: CreateGameDto = { difficulty: GameDifficulty.EASY };

      const config = (service as any).determineGameConfiguration(createGameDto);

      // EASY difficulty has 20x20 grid with 0.10 bomb density (from env defaults)
      expect(config.difficulty).toBe(GameDifficulty.EASY);
      expect(config.rows).toBe(20);
      expect(config.columns).toBe(20);
      expect(config.bombDensity).toBe(0.1);
    });

    it('should use default config when no parameters specified', () => {
      const createGameDto: CreateGameDto = {};
      configService.get.mockReturnValue('NORMAL');

      const config = (service as any).determineGameConfiguration(createGameDto);

      expect(config.difficulty).toBe(GameDifficulty.NORMAL);
      expect(config.rows).toBe(40);
      expect(config.columns).toBe(40);
      expect(config.bombDensity).toBe(0.15);
    });
  });
});
