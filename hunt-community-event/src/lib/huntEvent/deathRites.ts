import Logger from "../logger";
import { Client } from "discord.js";
import { saveEventData } from "./saveEventData";
import prisma from "../prisma";

export class EventDeathRites {

  static async track(client?: Client) {
    Logger.info("Death Rites event started");

    const eventUrl = "https://www.huntshowdown.com/community/death-rites";

    const html = await (await fetch(eventUrl)).text();

    // extract data
    const theLastRites = html.match(
      /<div class="d-number" id="d-counter2" data-value="(\d+)">/,
    )?.[1];
    const theUnQuietDead = html.match(
      /<div class="d-number" id="d-counter1" data-value="(\d+)">/,
    )?.[1];

    const payload = {
      theLastRites: parseInt(theLastRites || "0"),
      theUnQuietDead: parseInt(theUnQuietDead || "0"),
    };

    // Check if new data is less than previously saved data
    const resolvedBotId = parseInt(process.env.HUNTCET_BOT_ID || "0");
    const latest = await prisma.eventData.findFirst({
      where: { botId: resolvedBotId },
      orderBy: { createdAt: "desc" },
      select: { data: true },
    });

    let shouldSave = true;
    if (latest && latest.data) {
      const lastData = latest.data as any;
      if (lastData.theLastRites && lastData.theUnQuietDead) {
        if (payload.theLastRites < lastData.theLastRites ||
            payload.theUnQuietDead < lastData.theUnQuietDead) {
          Logger.info("Skipping update: new data is less than previous data");
          return {
            status: `TLR ${lastData.theLastRites.toLocaleString()} | TUD ${lastData.theUnQuietDead.toLocaleString()}`,
            description: `The Last Rites: ${lastData.theLastRites.toLocaleString()}\nThe Unquiet Dead: ${lastData.theUnQuietDead.toLocaleString()} \n${eventUrl}`,
          };
        }
      }
    }

    await saveEventData(payload, client);

    return {
      status: `TLR ${payload.theLastRites.toLocaleString()} | TUD ${payload.theUnQuietDead.toLocaleString()}`,
      description: `The Last Rites: ${payload.theLastRites.toLocaleString()}\nThe Unquiet Dead: ${payload.theUnQuietDead.toLocaleString()} \n${eventUrl}`,
    };
  }
}

export default EventDeathRites;
