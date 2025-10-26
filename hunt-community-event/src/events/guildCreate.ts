import { Events, Guild } from 'discord.js';
import { processGuild } from '../lib/guildProcessor.ts';

export default {
	name: Events.GuildCreate,
	async execute(guild: Guild) {
		await processGuild(guild);
	},
};
