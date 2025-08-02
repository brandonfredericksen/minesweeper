import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedRequest } from './auth.guard';
import { RateLimitService } from '../services/rate-limit.service';
import { LogsService } from '../services/logs.service';
import { LogAction } from '../entities';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly logsService: LogsService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.id;

    if (!userId) {
      return true;
    }

    const dailyLimit = this.configService.get<number>(
      'app.rateLimit.dailyGameLimit',
      50,
    );
    const windowSeconds = this.configService.get<number>(
      'app.rateLimit.windowSeconds',
      10,
    );
    const maxRequests = this.configService.get<number>(
      'app.rateLimit.maxRequests',
      3,
    );

    const [dailyCount, shortTermCount] = await Promise.all([
      this.rateLimitService.getDailyGameCount(userId),
      this.rateLimitService.getShortTermGameCount(userId),
    ]);

    if (dailyCount >= dailyLimit) {
      await this.logsService.logAction(
        userId,
        LogAction.RATE_LIMIT_EXCEEDED,
        request.ip,
        request.headers['user-agent'],
        null,
        'Daily game limit exceeded',
      );
      throw new HttpException(
        'Daily game creation limit exceeded',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (shortTermCount >= maxRequests) {
      await this.logsService.logAction(
        userId,
        LogAction.RATE_LIMIT_EXCEEDED,
        request.ip,
        request.headers['user-agent'],
        null,
        `Short-term rate limit exceeded (${maxRequests} games in ${windowSeconds} seconds)`,
      );
      throw new HttpException(
        `Too many games created. Maximum ${maxRequests} games per ${windowSeconds} seconds`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.rateLimitService.incrementShortTermCount(userId);
    return true;
  }
}
