import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  // Database
  database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5433', 10),
    username: process.env.DB_USERNAME || 'local',
    password: process.env.DB_PASSWORD || 'local',
    database: process.env.DB_DATABASE || 'local',
  },

  // Default user
  defaultUser: {
    username: process.env.DEFAULT_USER_USERNAME || 'default_user',
    apiKey:
      process.env.DEFAULT_USER_API_KEY ||
      'minesweeper_api_key_secure_token_default',
  },

  // Game settings
  game: {
    defaultDifficulty: process.env.DEFAULT_DIFFICULTY || 'NORMAL',
    maxGameSize: parseInt(process.env.MAX_GAME_SIZE || '100', 10),
    difficulties: {
      easy: {
        rows: parseInt(process.env.EASY_ROWS || '20', 10),
        columns: parseInt(process.env.EASY_COLUMNS || '20', 10),
        bombDensity: parseFloat(process.env.EASY_BOMB_DENSITY || '0.10'),
      },
      normal: {
        rows: parseInt(process.env.NORMAL_ROWS || '40', 10),
        columns: parseInt(process.env.NORMAL_COLUMNS || '40', 10),
        bombDensity: parseFloat(process.env.NORMAL_BOMB_DENSITY || '0.15'),
      },
      hard: {
        rows: parseInt(process.env.HARD_ROWS || '80', 10),
        columns: parseInt(process.env.HARD_COLUMNS || '80', 10),
        bombDensity: parseFloat(process.env.HARD_BOMB_DENSITY || '0.20'),
      },
    },
  },

  // Rate limiting
  rateLimit: {
    dailyGameLimit: parseInt(process.env.DAILY_GAME_LIMIT || '50', 10),
    windowSeconds: parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || '10', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '3', 10),
  },

  // Cache settings
  cache: {
    ttl: {
      gamesList: parseInt(process.env.CACHE_TTL_GAMES_LIST || '300', 10),
      singleGame: parseInt(process.env.CACHE_TTL_SINGLE_GAME || '3600', 10),
    },
  },
}));
