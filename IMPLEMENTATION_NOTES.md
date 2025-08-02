# Minesweeper API

Copy .env.example to .env and configure your settings.

### Game Difficulty System
I added preset difficulty levels (Easy, Normal, Hard) with different board sizes and bomb densities. Users can also create custom games by specifying their own parameters. If someone uses custom settings, the difficulty automatically gets set to "CUSTOM".

### Authentication & Rate Limiting
Every API call needs a bearer token. I added rate limiting because without it, someone could spam the create game endpoint and overwhelm the system. There's both a short-term limit (3 games per 10 seconds) and a daily limit (50 games per day).

### Caching
I added caching because database queries can get expensive, especially for the games list endpoint with pagination and filtering. The cache automatically invalidates when new games are created so data stays fresh.

### Audit Logging
I log all game creation attempts (successful and failed) plus rate limit violations. This helps with debugging and monitoring usage patterns.

## API Endpoints

All endpoints require a bearer token: `Authorization: Bearer <api_key>`

- `GET /games` - List user's games with pagination/filtering
  - `GET /games?difficulty=easy` - (Optional) Filter by difficulty
  - `GET /games?sort=createdAt` - (Optional) Sort by creation date
  - `GET /games?limit=10&page=2` - (Optional) Pagination
- `GET /games/:id` - Get specific game with all cells
- `POST /games` - Create new game (rate limited)
  - Body: `{ "rows": <number>, "columns": <number>, "difficulty": "easy|normal|hard" }`
  - All options are indeed optional with defaults in the .env file. 
  - If a user specifies each of row, column AND difficulty then I return an error if the difficulty does not match the row/column size.

## Database Setup

The app automatically creates a default user on startup so you can test immediately.

## Environment Config

Everything is configurable through environment variables - difficulty settings, rate limits, cache timeouts, etc. Check the `.env` file for all options.

## Implementation Notes

I added the following packages:
- `cache-manager` for caching along with `@nestjs/cache-manager` to integrate it with NestJS
- `@nestjs/config` for environment variable management
- `@nestjs/throttler` for rate limiting
- `Yup` for input validation


