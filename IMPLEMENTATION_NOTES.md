# Minesweeper API

Before running the app, copy .env.example to .env and configure your settings.

### Authentication & Rate Limiting
Every API call needs a bearer token. I added rate limiting because without it a bad actor could overwhelm the system. There's both a short-term limit (3 games per 10 seconds) and a daily limit (50 games per day).

### Game Difficulty System
I added preset difficulty levels (Easy, Normal, Hard) with different board sizes and bomb densities. Users can also create custom games by specifying their own parameters. If someone uses custom settings, the difficulty is automatically set to CUSTOM.

### Caching
I added caching because database queries can get expensive, especially for the games with a large number of cells. The cache automatically invalidates when new games are created so data stays fresh. The next step would be to revalidate the cache when a player makes a move.

### Logging
I log all game creation attempts (successful and failed) plus rate limit violations. This helps with debugging and monitoring usage.

## API Endpoints

All endpoints require a bearer token: `Authorization: Bearer <api_key>`

For testing, use bearer token: `minesweeper_api_key_secure_token_default`

- `GET /games` - List user's games with pagination/filtering
  - `GET /games?difficulty=easy` - (Optional) Filter by difficulty
  - `GET /games?sort=createdAt` - (Optional) Sort by creation date
  - `GET /games?limit=10&page=2` - (Optional) Pagination
- `GET /games/:id` - Get specific game with all cells
- `POST /games` - Create new game (rate limited)
  - **Options** You can specify either a difficulty (which has preset values) or specify any number of custom parameter(s):
    - `difficulty` (easy, normal, hard)
    - OR
    - `rows` (number of rows)
    - `columns` (number of columns)
    - `bombDensity` (number between 0.01 and 0.8)


## Database User Seeding

The app automatically creates a default user via seeding on startup so you can test immediately.

## Implementation Notes

### I added the following packages to enhance the functionality of the API:

- `cache-manager` for caching along with `@nestjs/cache-manager` to integrate it with NestJS.
- `@nestjs/config` for environment variable management.
- `@nestjs/throttler` for rate limiting.
- `Yup` for input validation.


