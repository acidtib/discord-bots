import { Events, Client } from 'discord.js';
import prisma from '../lib/prisma.ts';
import { processGuild } from '../lib/guildProcessor.ts';
import { Logger } from '../lib/logger.ts';

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
	},
};
