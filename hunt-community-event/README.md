# Hunt Community Event Bot

A Discord bot that displays Hunt: Showdown community event statistics.

## Setup

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start PostgreSQL database:
   ```bash
   docker-compose up -d
   ```

4. Set up environment variables:
   Create a `.env` file with:
   ```
   DISCORD_TOKEN=your_discord_bot_token
   HUNT_EVENT_SLUG=your_hunt_event_slug
   DATABASE_URL=postgresql://postgres:password@localhost:5432/hunt_community_events
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Start the bot:
   ```bash
   npm start
   ```

## Commands

The bot automatically provides community event information when added to a server.

## Prisma Commands

### Generate Prisma Client
After changing the schema, generate the client:
```bash
npx prisma generate
```

### Database Migrations
Create a new migration:
```bash
npx prisma migrate dev --name your_migration_name
```

Reset database and apply all migrations:
```bash
npx prisma migrate reset
```

Deploy migrations to production:
```bash
npx prisma migrate deploy
```

Check migration status:
```bash
npx prisma migrate status
```
