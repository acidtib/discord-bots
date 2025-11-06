import { BaseEventHandler, EventConfig, EventData, EventResult } from "./baseEventHandler";

export class EventDeathRites extends BaseEventHandler {
  protected getConfig(): EventConfig {
    return {
      eventUrl: "https://www.huntshowdown.com/community/death-rites",
      eventName: "Death Rites",
      extractData: this.extractData,
      formatResult: this.formatResult,
      validateProgress: this.validateProgress,
    };
  }

  private extractData(html: string): EventData {
    const theLastRitesMatch = html.match(
      /<div class="d-number" id="d-counter2" data-value="(\d+)">/,
    );
    const theUnQuietDeadMatch = html.match(
      /<div class="d-number" id="d-counter1" data-value="(\d+)">/,
    );

    if (!theLastRitesMatch || !theUnQuietDeadMatch) {
      throw new Error("Failed to extract event data from HTML - regex patterns not found");
    }

    return {
      theLastRites: parseInt(theLastRitesMatch[1]),
      theUnQuietDead: parseInt(theUnQuietDeadMatch[1]),
    };
  }

  private formatResult(data: EventData, eventUrl: string): EventResult {
    return {
      status: `TLR ${(data.theLastRites as number).toLocaleString()} | TUD ${(data.theUnQuietDead as number).toLocaleString()}`,
      description: `The Last Rites: ${(data.theLastRites as number).toLocaleString()}\nThe Unquiet Dead: ${(data.theUnQuietDead as number).toLocaleString()} \n${eventUrl}`,
    };
  }

  private validateProgress(newData: EventData, lastData: EventData): boolean {
    if (lastData.theLastRites && lastData.theUnQuietDead) {
      return (newData.theLastRites as number) >= (lastData.theLastRites as number) &&
             (newData.theUnQuietDead as number) >= (lastData.theUnQuietDead as number);
    }
    return true;
  }
}

export default EventDeathRites;
