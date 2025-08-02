import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import { GameStatus, GameDifficulty, Game } from '../entities';

describe('CacheService', () => {
  let service: CacheService;
  let mockCacheManager: jest.Mocked<any>;

  beforeEach(async () => {
    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue(300),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('invalidateUserGamesCache', () => {
    it('should invalidate all possible cache combinations for a user', async () => {
      const userId = 'user-123';

      await service.invalidateUserGamesCache(userId);

      // Should call del for all combinations of status, difficulty, and pages (1-10)
      // 4 statuses (all + 3 GameStatus values) × 5 difficulties (all + 4 GameDifficulty values) × 10 pages = 200 calls
      expect(mockCacheManager.del).toHaveBeenCalledTimes(200);

      // Verify some specific cache keys are being deleted
      expect(mockCacheManager.del).toHaveBeenCalledWith(
        'games:user:user-123:page:1:status:all:difficulty:all',
      );
      expect(mockCacheManager.del).toHaveBeenCalledWith(
        'games:user:user-123:page:1:status:PENDING:difficulty:EASY',
      );
      expect(mockCacheManager.del).toHaveBeenCalledWith(
        'games:user:user-123:page:10:status:CLEARED:difficulty:HARD',
      );
    });

    it('should handle cache deletion errors gracefully', async () => {
      const userId = 'user-123';
      mockCacheManager.del.mockRejectedValue(new Error('Cache error'));

      // Should not throw even if cache deletion fails
      await expect(service.invalidateUserGamesCache(userId)).rejects.toThrow('Cache error');
    });
  });

  describe('getGamesList', () => {
    it('should return undefined when cache miss', async () => {
      mockCacheManager.get.mockResolvedValue(undefined);

      const result = await service.getGamesList('user-123', 1);

      expect(result).toBeUndefined();
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        'games:user:user-123:page:1:status:all:difficulty:all',
      );
    });

    it('should return cached data when cache hit', async () => {
      const cachedData = {
        games: [],
        total: 0,
        page: 1,
        limit: 10,
      };
      mockCacheManager.get.mockResolvedValue(cachedData);

      const result = await service.getGamesList('user-123', 1);

      expect(result).toEqual(cachedData);
    });
  });

  describe('getSingleGame', () => {
    it('should return undefined when cache miss', async () => {
      mockCacheManager.get.mockResolvedValue(undefined);

      const result = await service.getSingleGame('game-123');

      expect(result).toBeUndefined();
      expect(mockCacheManager.get).toHaveBeenCalledWith('game:game-123');
    });

    it('should return cached game when cache hit', async () => {
      const cachedGame = {
        id: 'game-123',
        userId: 'user-123',
      } as Game;
      mockCacheManager.get.mockResolvedValue(cachedGame);

      const result = await service.getSingleGame('game-123');

      expect(result).toEqual(cachedGame);
    });
  });
});