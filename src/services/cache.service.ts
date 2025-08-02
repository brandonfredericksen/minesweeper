import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { generateGamesListCacheKey, generateGameCacheKey } from '../utils';
import { Game, GameStatus, GameDifficulty } from '../entities';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async getGamesList(
    userId: string,
    page: number,
    status?: string,
    difficulty?: string,
  ): Promise<
    { games: Game[]; total: number; page: number; limit: number } | undefined
  > {
    const key = generateGamesListCacheKey(userId, page, status, difficulty);
    return this.get<{
      games: Game[];
      total: number;
      page: number;
      limit: number;
    }>(key);
  }

  async setGamesList(
    userId: string,
    page: number,
    data: { games: Game[]; total: number; page: number; limit: number },
    status?: string,
    difficulty?: string,
  ): Promise<void> {
    const key = generateGamesListCacheKey(userId, page, status, difficulty);
    const ttl =
      this.configService.get<number>('app.cache.ttl.gamesList', 300) * 1000;
    await this.set(key, data, ttl);
  }

  async getSingleGame(gameId: string): Promise<Game | undefined> {
    const key = generateGameCacheKey(gameId);
    return this.get<Game>(key);
  }

  async setSingleGame(gameId: string, data: Game): Promise<void> {
    const key = generateGameCacheKey(gameId);
    const ttl =
      this.configService.get<number>('app.cache.ttl.singleGame', 3600) * 1000;
    await this.set(key, data, ttl);
  }

  async invalidateUserGamesCache(userId: string): Promise<void> {
    // Since in-memory cache doesn't provide key enumeration,
    // we'll invalidate specific cache patterns we know exist
    const statusValues = ['all', ...Object.values(GameStatus)];
    const difficultyValues = ['all', ...Object.values(GameDifficulty)];
    const maxPages = 10; // Reasonable assumption for max cached pages

    const keysToDelete: string[] = [];

    // Generate all possible cache key combinations
    for (let page = 1; page <= maxPages; page++) {
      for (const status of statusValues) {
        for (const difficulty of difficultyValues) {
          const key = generateGamesListCacheKey(
            userId,
            page,
            status === 'all' ? undefined : status,
            difficulty === 'all' ? undefined : difficulty,
          );
          keysToDelete.push(key);
        }
      }
    }

    // Delete all possible cache entries for this user
    const deletePromises = keysToDelete.map((key) => this.del(key));
    await Promise.all(deletePromises);
  }
}
