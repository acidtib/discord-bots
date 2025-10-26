import { Guild } from 'discord.js';
import prisma from './prisma.ts';
import Logger from './logger';

export async function processGuild(guild: Guild) {
  try {
    // create or update the guild
    const guildData = {
      discordId: guild.id,
      ownerId: guild.ownerId,
      name: guild.name,
      icon: guild.iconURL({ size: 2048 }),
      memberCount: guild.memberCount,
      active: true,
    };

    const existingGuild = await prisma.guild.findUnique({
      where: { discordId: guild.id }
    });

    if (existingGuild) {
      // update existing guild
      await prisma.guild.update({
        where: { discordId: guild.id },
        data: guildData
      });
    } else {
      // create new guild
      await prisma.guild.create({
        data: guildData
      });
    }

    Logger.info(`Successfully processed guild: ${guild.id}, ${guild.name}`);
  } catch (error) {
    Logger.error(`Error processing guild: ${guild.id}, ${guild.name}. Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}
