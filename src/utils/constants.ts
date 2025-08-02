export const CACHE_KEYS = {
  GAMES_LIST:
    'games:user:{userId}:page:{page}:status:{status}:difficulty:{difficulty}',
  SINGLE_GAME: 'game:{gameId}',
} as const;

export const RATE_LIMIT_KEYS = {
  DAILY_GAMES: 'daily_games:{userId}:{date}',
  SHORT_TERM_GAMES: 'short_term_games:{userId}',
} as const;

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
