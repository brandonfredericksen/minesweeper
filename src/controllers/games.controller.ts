import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { GamesService } from '../services/games.service';
import { LogsService } from '../services/logs.service';
import { AuthGuard, AuthenticatedRequest } from '../guards/auth.guard';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import { CreateGameDto, createGameSchema, getGamesQuerySchema } from '../dto';
import { LogAction } from '../entities';
import { validateWithYup } from '../utils';

@Controller('games')
@UseGuards(AuthGuard)
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly logsService: LogsService,
  ) {}

  @Get()
  async getAll(@Query() query: any, @Req() request: AuthenticatedRequest) {
    const userId = request.user.id;

    const validatedQuery = await validateWithYup(getGamesQuerySchema, query);

    return this.gamesService.findAllGames(userId, validatedQuery);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    const userId = request.user.id;
    const game = await this.gamesService.findOneGame(id, userId);

    if (!game) {
      throw new NotFoundException(`Game with id "${id}" not found`);
    }

    return game;
  }

  @Post()
  @UseGuards(RateLimitGuard)
  async create(
    @Body() createGameDto: CreateGameDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = request.user.id;

    await this.logsService.logAction(
      userId,
      LogAction.GAME_CREATE_ATTEMPT,
      request.ip,
      request.headers['user-agent'],
      null,
      JSON.stringify(createGameDto),
    );

    try {
      const validatedDto = await validateWithYup(
        createGameSchema,
        createGameDto,
      );
      const game = await this.gamesService.createGame(userId, validatedDto);

      await this.logsService.logAction(
        userId,
        LogAction.GAME_CREATE_SUCCESS,
        request.ip,
        request.headers['user-agent'],
        game.id,
        `Game created: ${game.difficulty} ${game.rows}x${game.columns}`,
      );

      return game;
    } catch (error) {
      await this.logsService.logAction(
        userId,
        LogAction.GAME_CREATE_FAILED,
        request.ip,
        request.headers['user-agent'],
        null,
        error instanceof Error ? error.message : 'Unknown error',
      );

      throw error;
    }
  }
}
