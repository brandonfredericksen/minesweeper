import 'reflect-metadata';
import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';

import appConfig from './config/app.config';
import { Game, GameCell, User, GameLog } from './entities';

// Controllers
import { GamesController } from './controllers/games.controller';

// Services
import { GamesService } from './services/games.service';
import { UsersService } from './services/users.service';
import { LogsService } from './services/logs.service';
import { CacheService } from './services/cache.service';
import { RateLimitService } from './services/rate-limit.service';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';

// Seeding
import { UserSeedService } from './database/seeds/user.seed';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('app.database.host'),
        port: configService.get<number>('app.database.port'),
        username: configService.get<string>('app.database.username'),
        password: configService.get<string>('app.database.password'),
        database: configService.get<string>('app.database.database'),
        entities: [join(__dirname, 'entities/*')],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Game, GameCell, User, GameLog]),
    CacheModule.register({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
  controllers: [GamesController],
  providers: [
    // Services
    GamesService,
    UsersService,
    LogsService,
    CacheService,
    RateLimitService,
    // Guards
    AuthGuard,
    RateLimitGuard,
    // Seeding
    UserSeedService,
  ],
})
export class AppModule {}
