import { CACHE_KEYS, RATE_LIMIT_KEYS } from './constants';

export function generateGamesListCacheKey(
  userId: string,
  page: number,
  status?: string,
  difficulty?: string,
): string {
  return CACHE_KEYS.GAMES_LIST.replace('{userId}', userId)
    .replace('{page}', page.toString())
    .replace('{status}', status || 'all')
    .replace('{difficulty}', difficulty || 'all');
}

export function generateGameCacheKey(gameId: string): string {
  return CACHE_KEYS.SINGLE_GAME.replace('{gameId}', gameId);
}

export function generateDailyRateLimitKey(userId: string): string {
  const today = new Date().toISOString().split('T')[0];
  return RATE_LIMIT_KEYS.DAILY_GAMES.replace('{userId}', userId).replace(
    '{date}',
    today,
  );
}

export function generateShortTermRateLimitKey(userId: string): string {
  return RATE_LIMIT_KEYS.SHORT_TERM_GAMES.replace('{userId}', userId);
}

export function generateGamesListCachePattern(userId: string): string {
  return `games:user:${userId}:*`;
}
