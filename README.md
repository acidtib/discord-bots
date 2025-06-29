# Freya Bot

A Discord bot that displays real-time server statistics for the Freya server in Dune: Awakening.

## Features

- Real-time server monitoring
- Displays current player count and maximum player capacity
- Shows the number of active Sietches
- Updates status every 11 minutes

## Setup

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

3. Export your Discord bot token:
```
export DISCORD_TOKEN=your_bot_token_here
```

4. Start the bot:
```bash
node index.js
```

## Bot Status Display

The bot's status will show:
- Current/Maximum player count
- Number of active Sietches

Example: "466/1500 Online, 25 Sietches"

## Data Source

The bot fetches data from the official QuestLog API:
`https://questlog.gg/dune-awakening/api/trpc/serverStatus.getServerStatus`

## Requirements

- Node.js v18 or higher
- Discord.js v14 or higher
- A Discord Bot Token
