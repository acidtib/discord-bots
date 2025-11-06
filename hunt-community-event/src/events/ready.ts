import { Events, Client, ActivityType } from 'discord.js';
import prisma from '../lib/prisma.ts';
import { processGuild } from '../lib/guildProcessor.ts';
import { Logger } from '../lib/logger.ts';
import { HuntEvent } from '../lib/huntEvent/index.ts';

export default {
	name: Events.ClientReady,
	once: true,
	async execute(client: Client) {
		Logger.info(`Ready! Logged in as ${client.user.tag}`);

		// process all guilds the bot is currently in
		Logger.info(`Processing ${client.guilds.cache.size} active guilds...`);
		for (const [guildId, guild] of client.guilds.cache) {
			await processGuild(guild);
		}

		// check if event is active
    const isEventActive = process.env.HUNT_EVENT_ACTIVE !== "false";
    if (!isEventActive) {
      client.user.setActivity({
        name: "Starting Soon",
        type: ActivityType.Custom,
      });

      client.application.edit({
        description: "Event starting soon - stay tuned!",
      });
      return;
    }

    const updateServerStatus = async () => {
      // start tracking event
  		await HuntEvent.execute(client);
    };

    // Set initial status
    updateServerStatus();

    // Update status every 25 minutes
    setInterval(updateServerStatus, 1500000);
	},
};
