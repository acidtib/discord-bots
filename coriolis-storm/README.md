# Coriolis Storm Bot

A Discord bot that displays a countdown timer to the next Apex Storm in Apex Legends. The bot updates its activity status every 15 seconds to show the remaining time until the next storm event.

## Features

- Real-time countdown to next Apex Storm
- Automatically calculates next Tuesday at 4 AM MT
- Updates status every 15 seconds
- Displays countdown in days, hours, minutes, and seconds format

## Requirements

- Node.js v18 or higher
- Discord Bot Token
- Discord.js v14 or higher

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

## How it Works

The bot calculates the next Tuesday at 4 AM MT (Mountain Time) and continuously updates its status to show the countdown. When the current storm ends, it automatically calculates the next storm date.

The status is displayed in the format: `Apex in Xd Xh Xm Xs` where:
- d = days
- h = hours
- m = minutes
- s = seconds

## Contributing

Feel free to submit issues and enhancement requests! 