import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LogsService } from '../services/logs.service';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly logsService: LogsService) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const logsService = this.logsService;

    const originalSend = res.send;
    res.send = function (body) {
      const responseTime = Date.now() - startTime;

      // Log the request after response is sent
      setImmediate(async () => {
        try {
          await logsService.logRequest(
            req.method,
            req.originalUrl || req.url,
            res.statusCode,
            req.user?.id,
            req.ip,
            req.get('user-agent'),
            responseTime,
          );
        } catch (error) {
          console.error('Failed to log request:', error);
        }
      });

      return originalSend.call(this, body);
    };

    next();
  }
}
