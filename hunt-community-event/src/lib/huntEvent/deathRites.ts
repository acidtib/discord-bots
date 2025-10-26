import Logger from "../logger";

export class EventDeathRites {

  static async track() {
    Logger.info("Death Rites event started");

    const eventUrl = "https://www.huntshowdown.com/community/death-rites";

    const html = await (await fetch(eventUrl)).text();

    // extract data
    const theLastRites = html.match(
      /<div class="d-number" id="d-counter2" data-value="(\d+)">/,
    )[1];
    const theUnQuietDead = html.match(
      /<div class="d-number" id="d-counter1" data-value="(\d+)">/,
    )[1];

    return {
      status: `TLR ${parseInt(theLastRites).toLocaleString()} | TUD ${parseInt(theUnQuietDead).toLocaleString()}`,
      description: `The Last Rites: ${parseInt(theLastRites).toLocaleString()}\nThe Unquiet Dead: ${parseInt(theUnQuietDead).toLocaleString()} \n${eventUrl}`,
    };
  }
}

export default EventDeathRites;
