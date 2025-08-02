import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Game, GameCell, GameStatus, GameDifficulty } from '../entities';
import { CreateGameDto, GetGamesQueryDto } from '../dto';
import { CacheService } from './cache.service';
import { RateLimitService } from './rate-limit.service';
import {
  generateGameBoard,
  getDifficultyConfig,
  detectDifficulty,
} from '../utils';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    @InjectRepository(GameCell)
    private readonly gameCellsRepository: Repository<GameCell>,
    private readonly cacheService: CacheService,
    private readonly rateLimitService: RateLimitService,
    private readonly configService: ConfigService,
  ) {}

  async createGame(
    userId: string,
    createGameDto: CreateGameDto,
  ): Promise<Game> {
    let rows: number;
    let columns: number;
    let bombDensity: number;
    let difficulty: GameDifficulty;

    // Case 1: No parameters provided - use default difficulty
    if (
      !createGameDto.difficulty &&
      !createGameDto.rows &&
      !createGameDto.columns
    ) {
      const defaultDifficulty = this.configService.get<string>(
        'app.game.defaultDifficulty',
        'NORMAL',
      ) as GameDifficulty;
      const config = getDifficultyConfig(defaultDifficulty);
      if (!config) {
        throw new Error('Invalid default difficulty configuration');
      }
      rows = config.rows;
      columns = config.columns;
      bombDensity = config.bombDensity;
      difficulty = defaultDifficulty;
    }
    // Case 2: Difficulty specified
    else if (createGameDto.difficulty) {
      const config = getDifficultyConfig(createGameDto.difficulty);
      if (!config) {
        throw new Error('Invalid difficulty configuration');
      }
      rows = config.rows;
      columns = config.columns;
      bombDensity = config.bombDensity;
      difficulty = createGameDto.difficulty;
    }
    // Case 3: Custom parameters provided
    else {
      rows = createGameDto.rows!;
      columns = createGameDto.columns!;
      bombDensity = createGameDto.bombDensity || 0.15; // Default to NORMAL density
      difficulty = detectDifficulty(rows, columns, bombDensity);
    }

    const gameBoard = generateGameBoard(rows, columns, bombDensity);

    const queryRunner =
      this.gamesRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const game = queryRunner.manager.create(Game, {
        userId,
        status: GameStatus.Pending,
        difficulty,
        rows,
        columns,
        bombDensity,
      });

      const savedGame = await queryRunner.manager.save(game);

      const gameCells = gameBoard.cells.map((cellData) =>
        queryRunner.manager.create(GameCell, {
          game: savedGame,
          xCoordinate: cellData.xCoordinate,
          yCoordinate: cellData.yCoordinate,
          isMine: cellData.isMine,
          neighboringBombCount: cellData.neighboringBombCount,
          status: cellData.status,
        }),
      );

      await queryRunner.manager.save(gameCells);
      await queryRunner.commitTransaction();

      await this.rateLimitService.incrementDailyGameCount(userId);
      await this.cacheService.invalidateUserGamesCache(userId);

      const gameWithCells = await this.findOneGame(savedGame.id, userId);
      if (gameWithCells) {
        await this.cacheService.setSingleGame(savedGame.id, gameWithCells);
      }

      return savedGame;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllGames(
    userId: string,
    queryDto: GetGamesQueryDto,
  ): Promise<{ games: Game[]; total: number; page: number; limit: number }> {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;

    const cached = await this.cacheService.getGamesList(
      userId,
      page,
      queryDto.status,
      queryDto.difficulty,
    );

    if (cached) {
      return cached;
    }

    const queryBuilder = this.gamesRepository
      .createQueryBuilder('game')
      .where('game.userId = :userId', { userId })
      .orderBy('game.createdAt', 'DESC');

    if (queryDto.status) {
      queryBuilder.andWhere('game.status = :status', {
        status: queryDto.status,
      });
    }

    if (queryDto.difficulty) {
      queryBuilder.andWhere('game.difficulty = :difficulty', {
        difficulty: queryDto.difficulty,
      });
    }

    const total = await queryBuilder.getCount();

    const games = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const result = {
      games,
      total,
      page,
      limit,
    };

    await this.cacheService.setGamesList(
      userId,
      page,
      result,
      queryDto.status,
      queryDto.difficulty,
    );

    return result;
  }

  async findOneGame(gameId: string, userId?: string): Promise<Game | null> {
    const cached = await this.cacheService.getSingleGame(gameId);
    if (cached) {
      return cached;
    }

    const queryBuilder = this.gamesRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.cells', 'cells')
      .where('game.id = :gameId', { gameId })
      .orderBy('cells.yCoordinate', 'ASC')
      .addOrderBy('cells.xCoordinate', 'ASC');

    if (userId) {
      queryBuilder.andWhere('game.userId = :userId', { userId });
    }

    const game = await queryBuilder.getOne();

    if (game) {
      await this.cacheService.setSingleGame(gameId, game);
    }

    return game;
  }
}
