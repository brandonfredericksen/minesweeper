import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import {
  generateDailyRateLimitKey,
  generateShortTermRateLimitKey,
} from '../utils';

@Injectable()
export class RateLimitService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  async getDailyGameCount(userId: string): Promise<number> {
    const key = generateDailyRateLimitKey(userId);
    const count = await this.cacheManager.get<number>(key);
    return count || 0;
  }

  async incrementDailyGameCount(userId: string): Promise<number> {
    const key = generateDailyRateLimitKey(userId);
    const currentCount = await this.getDailyGameCount(userId);
    const newCount = currentCount + 1;

    // Cache for 24 hours
    await this.cacheManager.set(key, newCount, 24 * 60 * 60 * 1000);
    return newCount;
  }

  async getShortTermGameCount(userId: string): Promise<number> {
    const key = generateShortTermRateLimitKey(userId);
    const count = await this.cacheManager.get<number>(key);
    return count || 0;
  }

  async incrementShortTermCount(userId: string): Promise<number> {
    const key = generateShortTermRateLimitKey(userId);
    const currentCount = await this.getShortTermGameCount(userId);
    const newCount = currentCount + 1;

    const windowSeconds = this.configService.get<number>(
      'app.rateLimit.windowSeconds',
      10,
    );
    await this.cacheManager.set(key, newCount, windowSeconds * 1000);
    return newCount;
  }

  async resetDailyCount(userId: string): Promise<void> {
    const key = generateDailyRateLimitKey(userId);
    await this.cacheManager.del(key);
  }

  async resetShortTermCount(userId: string): Promise<void> {
    const key = generateShortTermRateLimitKey(userId);
    await this.cacheManager.del(key);
  }
}
