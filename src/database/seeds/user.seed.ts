import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../services/users.service';

@Injectable()
export class UserSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UserSeedService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.seedDefaultUser();
  }

  private async seedDefaultUser(): Promise<void> {
    try {
      const defaultUsername = this.configService.get<string>(
        'app.defaultUser.username',
        'default_user',
      );
      const defaultApiKey = this.configService.get<string>(
        'app.defaultUser.apiKey',
        'minesweeper_api_key_secure_token_default',
      );

      const existingUser =
        await this.usersService.findByUsername(defaultUsername);

      if (existingUser) {
        this.logger.log(`Default user '${defaultUsername}' already exists`);
        return;
      }

      await this.usersService.createUser(defaultUsername, defaultApiKey);
      this.logger.log(`Default user '${defaultUsername}' created successfully`);
      this.logger.log(`API Key: ${defaultApiKey}`);
    } catch (error) {
      this.logger.error('Failed to seed default user', error);
    }
  }
}
