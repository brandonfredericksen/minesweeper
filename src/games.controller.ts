import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private readonly gameService: GamesService) {}

  @Get()
  async getAll() {
    // TODO: Implement get all games logic here
    return [];
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const game = await this.gameService.findOneGame(id);

    if (!game) {
      throw new NotFoundException(`Game with id "${id}" not found`);
    }

    return game;
  }

  @Post()
  create() {
    // TODO: Implement game creation logic here
    throw new Error('Not implemented');
  }
}
