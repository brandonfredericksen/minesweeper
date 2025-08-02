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
import { AuthGuard, AuthenticatedRequest } from '../guards/auth.guard';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import { CreateGameDto, createGameSchema, getGamesQuerySchema } from '../dto';
import { validateWithYup } from '../utils';

@Controller('games')
@UseGuards(AuthGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  async getAll(
    @Query() query: Record<string, unknown>,
    @Req() request: AuthenticatedRequest,
  ) {
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

    try {
      const validatedDto = await validateWithYup(
        createGameSchema,
        createGameDto,
      );
      const game = await this.gamesService.createGame(userId, validatedDto);

      return game;
    } catch (error) {
      throw error;
    }
  }
}
