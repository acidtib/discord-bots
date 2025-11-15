import { BaseEventHandler, EventConfig, EventData, EventResult } from "./baseEventHandler";

export class EventPlowsharesPitchforks extends BaseEventHandler {
  protected getConfig(): EventConfig {
    return {
      eventUrl: "https://www.huntshowdown.com/community/plowshares-and-pitchforks",
      eventName: "Plowshares and Pitchforks",
      extractData: this.extractData,
      formatResult: this.formatResult,
      validateProgress: this.validateProgress,
    };
  }

  private extractData(html: string): EventData {
    const redneckRampageMatch = html.match(
      /<div class="d-number" id="d-counter2" data-value="(\d+)">/,
    );
    const theSowersMatch = html.match(
      /<div class="d-number" id="d-counter1" data-value="(\d+)">/,
    );

    if (!redneckRampageMatch || !theSowersMatch) {
      throw new Error("Failed to extract event data from HTML - regex patterns not found");
    }

    return {
      redneckRampage: parseInt(redneckRampageMatch[1]),
      theSowers: parseInt(theSowersMatch[1]),
    };
  }

  private formatResult(data: EventData, eventUrl: string): EventResult {
    return {
      status: `RR ${(data.redneckRampage as number).toLocaleString()} | TS ${(data.theSowers as number).toLocaleString()}`,
      description: `Redneck Rampage: ${(data.redneckRampage as number).toLocaleString()}\nThe Sowers: ${(data.theSowers as number).toLocaleString()} \n${eventUrl}`,
    };
  }

  private validateProgress(newData: EventData, lastData: EventData): boolean {
    if (lastData.redneckRampage && lastData.theSowers) {
      return (newData.redneckRampage as number) >= (lastData.redneckRampage as number) &&
             (newData.theSowers as number) >= (lastData.theSowers as number);
    }
    return true;
  }
}

export default EventPlowsharesPitchforks;
