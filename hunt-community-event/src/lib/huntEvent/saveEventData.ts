import { isDeepStrictEqual } from "util";
import prisma from "../prisma";
import { Prisma } from "../../../generated/prisma/client";

export async function saveEventData(
  data: Record<string, unknown>,
  botId?: number,
) {
  const resolvedBotId = botId ?? parseInt(process.env.HUNTCET_BOT_ID || "0", 10);

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
  }
}

