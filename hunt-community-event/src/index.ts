import { Client, Events, GatewayIntentBits, ActivityType } from "discord.js";
import { readdir, stat } from "fs/promises";
import { join, extname } from "path";

const eventData = {
  slug: process.env.HUNT_EVENT_SLUG,
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Load events dynamically
const eventsDir = join(process.cwd(), "src", "events");

async function loadEvents(dir: string) {
  const entries = await readdir(dir);

  for (const entry of entries) {
    const entryPath = join(dir, entry);
    const stats = await stat(entryPath);

    if (stats.isFile() && extname(entry) === ".ts") {
      const event = await import(entryPath);
      const eventModule = event.default || event;

      if (eventModule.once) {
        client.once(eventModule.name, (...args) => eventModule.execute(...args));
      } else {
        client.on(eventModule.name, (...args) => eventModule.execute(...args));
      }
    }
  }
}

await loadEvents(eventsDir);

client.login(process.env.DISCORD_TOKEN);
