import 'reflect-metadata';
import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { Game, GameCell } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5433,
      username: 'local',
      password: 'local',
      database: 'local',
      entities: [join(__dirname, 'entities/*')],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Game, GameCell]),
  ],
  controllers: [GamesController],
  providers: [GamesService],
})

export class AppModule {}
