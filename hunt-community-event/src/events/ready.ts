import { Events } from 'discord.js';
import prisma from '../lib/prisma.ts';

export default {
	name: Events.ClientReady,
	once: true,
	async execute(client: any) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		const guilds = await prisma.guild.findMany();
		console.log(`Found ${guilds.length} guilds`);
	},
};
