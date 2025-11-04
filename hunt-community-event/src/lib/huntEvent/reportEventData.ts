import { Client, TextChannel, ChannelType } from "discord.js";
import prisma from "../prisma";
import { Logger } from "../logger";

export async function reportEventData(
  client: Client,
  data: Record<string, unknown>,
  botId: number,
) {
  try {
    // Get all guild settings where postUpdates is enabled and channelId is set
    const guildSettings = await prisma.guildBotSetting.findMany({
      where: {
        botId,
        postUpdates: true,
        channelId: { not: null },
      },
    });

    if (guildSettings.length === 0) {
      Logger.info("No guilds configured for event updates");
      return;
    }

    // Format the message content based on event data
    const messageContent = formatEventMessage(data);

    // Send messages to all configured channels
    const promises = guildSettings.map(async (setting) => {
      try {
        const channel = await client.channels.fetch(setting.channelId!);

        if (channel && channel.type === ChannelType.GuildText) {
          await (channel as TextChannel).send(messageContent);
        } else {
          Logger.warn(
            `Channel ${setting.channelId} is not a text channel or was not found`,
          );
        }
      } catch (error) {
        Logger.error(`Failed to send message to channel ${setting.channelId} in guild ${setting.guildId}: ${error as string}`);
      }
    });

    await Promise.allSettled(promises);
  } catch (error) {
    Logger.error(`Error in reportEventData: ${error as string}`);
  }
}

function formatEventMessage(data: Record<string, unknown>): string {
  // Check for Bloodshed Bileweavers event structure
  if (process.env.HUNT_EVENT_SLUG === "bloodshed_bileweavers") {
    const { current, total, stage1, stage2, stage3 } = data;
    
    let stage: number | string;
    let maxForStage: number;
    let percentage: number;

    if (typeof current === "number" && typeof stage1 === "number" && typeof stage2 === "number" && typeof stage3 === "number") {
      if (current < stage1) {
        stage = 1;
        maxForStage = stage1;
        percentage = Math.floor((current / stage1) * 100);
      } else if (current < stage1 + stage2) {
        stage = 2;
        maxForStage = stage1 + stage2;
        percentage = Math.floor(((current - stage1) / stage2) * 100);
      } else if (current < stage1 + stage2 + stage3) {
        stage = 3;
        maxForStage = stage1 + stage2 + stage3;
        percentage = Math.floor(((current - stage1 - stage2) / stage3) * 100);
      } else {
        stage = "Complete";
        maxForStage = total as number;
        percentage = 100;
      }

      return `🎯 **Bloodshed Bileweavers - Event Update**\n\n` +
        `**Stage ${stage}** - ${percentage}% Complete\n` +
        `Progress: ${current.toLocaleString()}/${maxForStage.toLocaleString()}\n` +
        `Total Kills: ${current.toLocaleString()}/${(total as number).toLocaleString()}\n\n`;
    }
  }

  // Check for Death Rites event structure
  if (process.env.HUNT_EVENT_SLUG === "death_rites") {
    const { theLastRites, theUnQuietDead } = data;
    
    return `🎯 **Death Rites - Event Update**\n\n` +
      `**The Last Rites:** ${(theLastRites as number).toLocaleString()}\n` +
      `**The Unquiet Dead:** ${(theUnQuietDead as number).toLocaleString()}\n\n`;
  }

  // Fallback to a generic message
  return `🎯 **${process.env.HUNT_EVENT_SLUG?.replace("_", " ").toUpperCase()} Event Update**\n\nEvent data has been updated. Check your server for the latest information!`;
}

