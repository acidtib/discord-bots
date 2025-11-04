import Logger from "../logger";
import { Client } from "discord.js";
import { saveEventData } from "./saveEventData";

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

    await saveEventData(payload, client);

    return {
      status: `TLR ${payload.theLastRites.toLocaleString()} | TUD ${payload.theUnQuietDead.toLocaleString()}`,
      description: `The Last Rites: ${payload.theLastRites.toLocaleString()}\nThe Unquiet Dead: ${payload.theUnQuietDead.toLocaleString()} \n${eventUrl}`,
    };
  }
}

export default EventDeathRites;
