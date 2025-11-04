import {
  Client,
  TextChannel,
  ChannelType,
  EmbedBuilder,
  MessageCreateOptions,
} from "discord.js";
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

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: { image: true },
    });

    if (!bot) {
      Logger.warn(`Bot ${botId} not found when preparing event update message`);
    }

    // Format the message content based on event data
    const messageContent = formatEventMessage(data, bot?.image ?? undefined);

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

function formatEventMessage(
  data: Record<string, unknown>,
  botImagePath?: string,
): MessageCreateOptions {
  const slug = process.env.HUNT_EVENT_SLUG ?? "community_event";

  if (slug === "bloodshed_bileweavers") {
    const { current, total, stage1, stage2, stage3 } = data;

    if (
      typeof current === "number" &&
      typeof total === "number" &&
      typeof stage1 === "number" &&
      typeof stage2 === "number" &&
      typeof stage3 === "number"
    ) {
      const stageData = resolveBloodshedStage(current, stage1, stage2, stage3, total);
      const totalPercentage = calculatePercentage(current, total);

      const stageFields = [
        { name: "Stage", value: stageData.label, inline: true },
        {
          name: "Progress",
          value:
            stageData.label === "Complete"
              ? "Event complete"
              : `${stageData.progressValue.toLocaleString()}/${stageData.stageGoal.toLocaleString()} (${stageData.stagePercentage}%)`,
          inline: true,
        },
        {
          name: "Total Kills",
          value: `${current.toLocaleString()}/${total.toLocaleString()} (${totalPercentage}%)`,
          inline: false,
        },
      ];

      const embed = new EmbedBuilder()
        .setTitle("Event Update")
        .setDescription("Fresh intel from the Bayou. Here's where the Hunters stand.")
        .setColor(0xb91c1c)
        .setTimestamp(new Date())
        .addFields(...stageFields)
        .setFooter({ text: "HuntCET", iconURL: "https://huntcet.com/icon.png" });

      const thumbnailUrl = resolveBotImageUrl(
        botImagePath,
      );

      if (thumbnailUrl) {
        embed.setThumbnail(thumbnailUrl);
      }

      return { embeds: [embed] };
    }
  }

  if (slug === "death_rites") {
    const { theLastRites, theUnQuietDead } = data;

    if (typeof theLastRites === "number" && typeof theUnQuietDead === "number") {
      const embed = new EmbedBuilder()
        .setTitle("Event Update")
        .setDescription("A fresh tally of the rituals performed across the Bayou.")
        .setColor(0x4c1d95)
        .setTimestamp(new Date())
        .addFields(
          { name: "The Last Rites", value: theLastRites.toLocaleString(), inline: true },
          { name: "The Unquiet Dead", value: theUnQuietDead.toLocaleString(), inline: true },
        )
        .setFooter({ text: "HuntCET", iconURL: "https://huntcet.com/icon.png" });

      const thumbnailUrl = resolveBotImageUrl(botImagePath);

      if (thumbnailUrl) {
        embed.setThumbnail(thumbnailUrl);
      }

      return { embeds: [embed] };
    }
  }

  return buildFallbackEmbed(slug, data, botImagePath);
}

function resolveBloodshedStage(
  current: number,
  stage1: number,
  stage2: number,
  stage3: number,
  total: number,
) {
  const stages = [
    { label: "Stage 1", goal: stage1 },
    { label: "Stage 2", goal: stage2 },
    { label: "Stage 3", goal: stage3 },
  ];

  let previousMilestone = 0;

  for (const stage of stages) {
    if (Number.isFinite(stage.goal) && current < stage.goal) {
      const tierProgress = Math.max(0, current - previousMilestone);
      const tierGoal = Math.max(0, stage.goal - previousMilestone);

      return {
        label: stage.label,
        progressValue: current,
        stageGoal: stage.goal,
        stagePercentage: calculatePercentage(current, stage.goal),
        nextMilestone: stage.goal,
        tierProgress,
        tierGoal,
        tierPercentage: tierGoal > 0 ? calculatePercentage(tierProgress, tierGoal) : 0,
      };
    }

    previousMilestone = stage.goal;
  }

  const tierProgress = Math.max(0, current - previousMilestone);
  const tierGoal = Math.max(0, total - previousMilestone);

  return {
    label: "Complete",
    progressValue: current,
    stageGoal: Math.max(total, stage3),
    stagePercentage: 100,
    nextMilestone: null,
    tierProgress,
    tierGoal,
    tierPercentage: tierGoal > 0 ? calculatePercentage(tierProgress, tierGoal) : 100,
  };
}

function calculatePercentage(value: number, goal: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(goal) || goal <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.floor((value / goal) * 100)));
}

function buildFallbackEmbed(
  slug: string,
  data: Record<string, unknown>,
  botImagePath?: string,
): MessageCreateOptions {

  const embed = new EmbedBuilder()
    .setTitle("Event Update")
    .setDescription("Event data has been updated.")
    .setColor(0x1d4ed8)
    .setTimestamp(new Date())
    .setFooter({ text: "HuntCET", iconURL: "https://huntcet.com/icon.png" });

  const thumbnailUrl = resolveBotImageUrl(botImagePath);

  if (thumbnailUrl) {
    embed.setThumbnail(thumbnailUrl);
  }

  const formattedData = formatDataFields(data);
  if (formattedData.length > 0) {
    embed.addFields(
      formattedData.map(({ name, value }) => ({ name, value, inline: true })).slice(0, 25),
    );
  }

  return { embeds: [embed] };
}

function resolveBotImageUrl(
  imagePath?: string,
  fallback?: string,
): string | undefined {
  if (typeof imagePath !== "string" || imagePath.trim().length === 0) {
    return fallback;
  }

  const trimmed = imagePath.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  return `https://huntcet.com${normalized}`;
}

function formatDataFields(data: Record<string, unknown>) {
  return Object.entries(data)
    .filter((entry): entry is [string, number | string | boolean] => {
      const [, value] = entry;
      return (
        typeof value === "number" ||
        typeof value === "string" ||
        typeof value === "boolean"
      );
    })
    .map(([key, value]) => ({
      name: key
        .split("_")
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" "),
      value:
        typeof value === "number"
          ? value.toLocaleString()
          : typeof value === "boolean"
            ? value ? "Yes" : "No"
            : value,
    }))
    .filter(({ value }) => value.toString().trim().length > 0);
}

