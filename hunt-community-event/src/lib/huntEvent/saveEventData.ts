import { isDeepStrictEqual } from "util";
import { Client } from "discord.js";
import prisma from "../prisma";
import { Prisma } from "../../../generated/prisma/client";
import { reportEventData } from "./reportEventData";

export async function saveEventData(
  data: Record<string, unknown>,
  client?: Client,
) {
  const resolvedBotId = parseInt(process.env.HUNTCET_BOT_ID || "0");

  const latest = await prisma.eventData.findFirst({
    where: { botId: resolvedBotId },
    orderBy: { createdAt: "desc" },
    select: { data: true },
  });

  if (!latest || !isDeepStrictEqual(latest.data, data)) {
    await prisma.eventData.create({
      data: {
        botId: resolvedBotId,
        data: data as Prisma.InputJsonValue,
      },
    });

    // Report event data changes to configured guilds
    if (client) {
      await reportEventData(client, data, resolvedBotId);
    }
  }
}

