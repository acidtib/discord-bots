import Logger from "../logger";
import { Client } from "discord.js";
import { saveEventData } from "./saveEventData";
import prisma from "../prisma";

export interface EventData {
  [key: string]: number | string;
}

export interface EventResult {
  status: string;
  description: string;
}

export interface EventConfig {
  eventUrl: string;
  eventName: string;
  extractData: (html: string) => EventData;
  formatResult: (data: EventData, eventUrl: string) => EventResult;
  validateProgress: (newData: EventData, lastData: EventData) => boolean;
}

export abstract class BaseEventHandler {
  protected abstract getConfig(): EventConfig;

  static async track(client?: Client): Promise<EventResult> {
    const instance = new (this as any)();
    return await instance.executeTrack(client);
  }

  private async executeTrack(client?: Client): Promise<EventResult> {
    const config = this.getConfig();

    try {
      // Fetch and parse data
      const data = await this.fetchAndParseData(config);

      // Check if we should save (data validation)
      const shouldSave = await this.shouldSaveData(data, config);

      if (!shouldSave.save) {
        Logger.info(`Skipping update for ${config.eventName}: ${shouldSave.reason}`);
        return config.formatResult(shouldSave.fallbackData!, config.eventUrl);
      }

      // Save the data
      await saveEventData(data, client);

      // Return formatted result
      return config.formatResult(data, config.eventUrl);

    } catch (error) {
      Logger.error(`Failed to process ${config.eventName}: ${error.message}`);
      return await this.handleError(config);
    }
  }

  private async fetchAndParseData(config: EventConfig): Promise<EventData> {
    const response = await fetch(config.eventUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    try {
      const data = config.extractData(html);
      this.validateExtractedData(data);
      return data;
    } catch (error) {
      throw new Error(`Data extraction failed: ${error.message}`);
    }
  }

  private validateExtractedData(data: EventData): void {
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'number' && isNaN(value)) {
        throw new Error(`Invalid number for ${key}: ${value}`);
      }
    }
  }

  private async shouldSaveData(
    newData: EventData,
    config: EventConfig
  ): Promise<{ save: boolean; reason?: string; fallbackData?: EventData }> {
    const resolvedBotId = parseInt(process.env.HUNTCET_BOT_ID || "0");
    const latest = await prisma.eventData.findFirst({
      where: { botId: resolvedBotId },
      orderBy: { createdAt: "desc" },
      select: { data: true },
    });

    if (!latest || !latest.data) {
      return { save: true };
    }

    const lastData = latest.data as EventData;

    if (!config.validateProgress(newData, lastData)) {
      return {
        save: false,
        reason: "new data is less than previous data",
        fallbackData: lastData
      };
    }

    return { save: true };
  }

  private async handleError(config: EventConfig): Promise<EventResult> {
    // Try to return last known good data
    const resolvedBotId = parseInt(process.env.HUNTCET_BOT_ID || "0");
    const latest = await prisma.eventData.findFirst({
      where: { botId: resolvedBotId },
      orderBy: { createdAt: "desc" },
      select: { data: true },
    });

    if (latest && latest.data) {
      const lastData = latest.data as EventData;
      const result = config.formatResult(lastData, config.eventUrl);

      // Add cached indicators
      return {
        status: `${result.status} (cached)`,
        description: `${result.description}\n\n⚠️ Using cached data - unable to fetch latest`,
      };
    }

    // Ultimate fallback
    return {
      status: "Event data unavailable",
      description: `Unable to fetch ${config.eventName} data\n\n${config.eventUrl}\n\n⚠️ Check logs for details`,
    };
  }
}
