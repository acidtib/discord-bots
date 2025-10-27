import { Events, Guild } from 'discord.js';
import prisma from '../lib/prisma.ts';
import { Logger } from '../lib/logger.ts';

export default {
	name: Events.GuildDelete,
	async execute(guild: Guild) {
		try {
			const existingGuild = await prisma.guild.findUnique({
				where: { discordId: guild.id }
			});

			if (existingGuild) {
				await prisma.guild.update({
					where: { discordId: guild.id },
					data: { active: false }
				});
			}
		} catch (error) {
			Logger.error(`Error updating guild active status: ${guild.id}, ${guild.name}. Error: ${error instanceof Error ? error.message : String(error)}`);
		}
	},
};
