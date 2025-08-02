import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { generateGamesListCacheKey, generateGameCacheKey } from '../utils';
import { Game } from '../entities';

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
    return this.get(key);
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
    return this.get(key);
  }

  async setSingleGame(gameId: string, data: Game): Promise<void> {
    const key = generateGameCacheKey(gameId);
    const ttl =
      this.configService.get<number>('app.cache.ttl.singleGame', 3600) * 1000;
    await this.set(key, data, ttl);
  }

  async invalidateUserGamesCache(userId: string): Promise<void> {
    // Note: In a real implementation with Redis, we would use SCAN + DEL
    // For the in-memory cache, we'll need to implement a different approach
    // This is a simplified version that would need enhancement for production
    const keys = await this.getAllKeys();
    const userKeys = keys.filter((key) =>
      key.startsWith(`games:user:${userId}:`),
    );

    for (const key of userKeys) {
      await this.del(key);
    }
  }

  private async getAllKeys(): Promise<string[]> {
    // This is a simplified implementation
    // In production with Redis, you would use KEYS or SCAN commands
    // For in-memory cache, this would need to be implemented differently
    return [];
  }
}
