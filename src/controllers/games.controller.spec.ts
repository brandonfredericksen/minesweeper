import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from '../services/games.service';
import { AuthenticatedRequest, AuthGuard } from '../guards/auth.guard';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import { CreateGameDto, GetGamesQueryDto } from '../dto';
import { GameDifficulty, GameStatus, Game, User } from '../entities';

// Mock the utils module
jest.mock('../utils', () => ({
  validateWithYup: jest.fn(),
}));

import { validateWithYup } from '../utils';

describe('GamesController', () => {
  let controller: GamesController;
  let gamesService: jest.Mocked<GamesService>;

  const mockUser = { id: 'user-123' };
  const mockRequest = { user: mockUser } as AuthenticatedRequest;

  const mockGame = {
    id: 'game-123',
    userId: 'user-123',
    user: {
      id: 'user-123',
      username: 'testuser',
      apiKey: 'test-api-key',
      games: [],
      logs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User,
    status: GameStatus.Pending,
    difficulty: GameDifficulty.NORMAL,
    rows: 10,
    columns: 10,
    bombDensity: 0.15,
    createdAt: new Date(),
    updatedAt: new Date(),
    cells: [],
  } as Game;

  const mockGamesListResponse = {
    games: [mockGame],
    total: 1,
    page: 1,
    limit: 10,
  };

  beforeEach(async () => {
    const mockGamesService = {
      findAllGames: jest.fn(),
      findOneGame: jest.fn(),
      createGame: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        {
          provide: GamesService,
          useValue: mockGamesService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RateLimitGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<GamesController>(GamesController);
    gamesService = module.get(GamesService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return paginated games for authenticated user', async () => {
      const query = { page: 1, limit: 10 };
      const mockValidatedQuery: GetGamesQueryDto = { page: 1, limit: 10 };

      (validateWithYup as jest.Mock).mockResolvedValue(mockValidatedQuery);
      gamesService.findAllGames.mockResolvedValue(mockGamesListResponse);

      const result = await controller.getAll(query, mockRequest);

      expect(validateWithYup).toHaveBeenCalledWith(expect.any(Object), query);
      expect(gamesService.findAllGames).toHaveBeenCalledWith(
        mockUser.id,
        mockValidatedQuery,
      );
      expect(result).toEqual(mockGamesListResponse);
    });

    it('should handle query validation and pass validated query to service', async () => {
      const query = { page: '1', limit: '5' };
      const mockValidatedQuery: GetGamesQueryDto = { page: 1, limit: 5 };

      (validateWithYup as jest.Mock).mockResolvedValue(mockValidatedQuery);
      gamesService.findAllGames.mockResolvedValue(mockGamesListResponse);

      await controller.getAll(query, mockRequest);

      expect(validateWithYup).toHaveBeenCalledWith(expect.any(Object), query);
      expect(gamesService.findAllGames).toHaveBeenCalledWith(
        mockUser.id,
        mockValidatedQuery,
      );
    });

    it('should pass filter parameters to service', async () => {
      const query = {
        page: 1,
        limit: 10,
        status: GameStatus.Pending,
        difficulty: GameDifficulty.HARD,
      };
      const mockValidatedQuery: GetGamesQueryDto = {
        page: 1,
        limit: 10,
        status: GameStatus.Pending,
        difficulty: GameDifficulty.HARD,
      };

      (validateWithYup as jest.Mock).mockResolvedValue(mockValidatedQuery);
      gamesService.findAllGames.mockResolvedValue(mockGamesListResponse);

      await controller.getAll(query, mockRequest);

      expect(gamesService.findAllGames).toHaveBeenCalledWith(
        mockUser.id,
        mockValidatedQuery,
      );
    });
  });

  describe('findOne', () => {
    it('should return a game when found', async () => {
      const gameId = 'game-123';
      gamesService.findOneGame.mockResolvedValue(mockGame);

      const result = await controller.findOne(gameId, mockRequest);

      expect(gamesService.findOneGame).toHaveBeenCalledWith(
        gameId,
        mockUser.id,
      );
      expect(result).toEqual(mockGame);
    });

    it('should throw NotFoundException when game is not found', async () => {
      const gameId = 'non-existent-game';
      gamesService.findOneGame.mockResolvedValue(null);

      await expect(controller.findOne(gameId, mockRequest)).rejects.toThrow(
        new NotFoundException(`Game with id "${gameId}" not found`),
      );

      expect(gamesService.findOneGame).toHaveBeenCalledWith(
        gameId,
        mockUser.id,
      );
    });

    it('should pass correct parameters to service', async () => {
      const gameId = 'test-game-id';
      gamesService.findOneGame.mockResolvedValue(mockGame);

      await controller.findOne(gameId, mockRequest);

      expect(gamesService.findOneGame).toHaveBeenCalledWith(
        gameId,
        mockUser.id,
      );
    });
  });

  describe('create', () => {
    it('should create a game with valid DTO', async () => {
      const createGameDto: CreateGameDto = {
        difficulty: GameDifficulty.NORMAL,
      };
      const validatedDto = { difficulty: GameDifficulty.NORMAL };

      (validateWithYup as jest.Mock).mockResolvedValue(validatedDto);
      gamesService.createGame.mockResolvedValue(mockGame);

      const result = await controller.create(createGameDto, mockRequest);

      expect(validateWithYup).toHaveBeenCalledWith(
        expect.any(Object),
        createGameDto,
      );
      expect(gamesService.createGame).toHaveBeenCalledWith(
        mockUser.id,
        validatedDto,
      );
      expect(result).toEqual(mockGame);
    });

    it('should create a game with custom parameters', async () => {
      const createGameDto: CreateGameDto = {
        rows: 15,
        columns: 15,
        bombDensity: 0.2,
      };
      const validatedDto = {
        rows: 15,
        columns: 15,
        bombDensity: 0.2,
      };

      (validateWithYup as jest.Mock).mockResolvedValue(validatedDto);
      gamesService.createGame.mockResolvedValue(mockGame);

      const result = await controller.create(createGameDto, mockRequest);

      expect(validateWithYup).toHaveBeenCalledWith(
        expect.any(Object),
        createGameDto,
      );
      expect(gamesService.createGame).toHaveBeenCalledWith(
        mockUser.id,
        validatedDto,
      );
      expect(result).toEqual(mockGame);
    });

    it('should create a game with empty DTO (default settings)', async () => {
      const createGameDto: CreateGameDto = {};
      const validatedDto = {};

      (validateWithYup as jest.Mock).mockResolvedValue(validatedDto);
      gamesService.createGame.mockResolvedValue(mockGame);

      const result = await controller.create(createGameDto, mockRequest);

      expect(validateWithYup).toHaveBeenCalledWith(
        expect.any(Object),
        createGameDto,
      );
      expect(gamesService.createGame).toHaveBeenCalledWith(
        mockUser.id,
        validatedDto,
      );
      expect(result).toEqual(mockGame);
    });

    it('should propagate validation errors', async () => {
      const createGameDto: CreateGameDto = {
        difficulty: GameDifficulty.NORMAL,
        rows: 5, // Invalid when difficulty is specified
      };
      const validationError = new Error(
        'Cannot specify difficulty with custom parameters',
      );

      (validateWithYup as jest.Mock).mockRejectedValue(validationError);

      await expect(
        controller.create(createGameDto, mockRequest),
      ).rejects.toThrow(validationError);

      expect(validateWithYup).toHaveBeenCalledWith(
        expect.any(Object),
        createGameDto,
      );
      expect(gamesService.createGame).not.toHaveBeenCalled();
    });

    it('should propagate service errors', async () => {
      const createGameDto: CreateGameDto = {
        difficulty: GameDifficulty.NORMAL,
      };
      const validatedDto = { difficulty: GameDifficulty.NORMAL };
      const serviceError = new Error('Database connection failed');

      (validateWithYup as jest.Mock).mockResolvedValue(validatedDto);
      gamesService.createGame.mockRejectedValue(serviceError);

      await expect(
        controller.create(createGameDto, mockRequest),
      ).rejects.toThrow(serviceError);

      expect(gamesService.createGame).toHaveBeenCalledWith(
        mockUser.id,
        validatedDto,
      );
    });
  });
});
