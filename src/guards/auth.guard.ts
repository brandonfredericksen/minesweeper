import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from '../services/users.service';
import { extractBearerToken } from '../utils';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    username: string;
    apiKey: string;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    try {
      const token = extractBearerToken(authHeader);
      const user = await this.usersService.findByApiKey(token);

      if (!user) {
        throw new UnauthorizedException('Invalid API key');
      }

      request.user = {
        id: user.id,
        username: user.username,
        apiKey: user.apiKey,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid authorization token');
    }
  }
}
