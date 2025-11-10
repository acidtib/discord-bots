import { BaseEventHandler, EventConfig, EventData, EventResult } from "./baseEventHandler";

export class EventBloodshedBileweavers extends BaseEventHandler {
  protected getConfig(): EventConfig {
    return {
      eventUrl: "https://www.huntshowdown.com/community/bloodshed-bileweavers",
      eventName: "Bloodshed Bileweavers",
      extractData: this.extractData,
      formatResult: this.formatResult,
      validateProgress: this.validateProgress,
    };
  }

  private extractData(html: string): EventData {
    const currentMatch = html.match(/let\s+getCurrentKills\s*=\s*(\d+)/);
    const totalMatch = html.match(/TOTAL_KILLS\s*=\s*(\d+)/);
    const stage1Match = html.match(/STAGE_1_MAX\s*=\s*(\d+)/);
    const stage2Match = html.match(/STAGE_2_MAX\s*=\s*(\d+)/);
    const stage3Match = html.match(/STAGE_3_MAX\s*=\s*(\d+)/);

    if (!currentMatch || !totalMatch || !stage1Match || !stage2Match || !stage3Match) {
      throw new Error("Failed to extract event data from HTML - regex patterns not found");
    }

    return {
      current: parseInt(currentMatch[1]),
      total: parseInt(totalMatch[1]),
      stage1: parseInt(stage1Match[1]),
      stage2: parseInt(stage2Match[1]),
      stage3: parseInt(stage3Match[1]),
    };
  }

  private formatResult(data: EventData, eventUrl: string): EventResult {
    const current = data.current as number;
    const total = data.total as number;
    const stage1 = data.stage1 as number;
    const stage2 = data.stage2 as number;
    const stage3 = data.stage3 as number;

    let stage, progress, maxForStage, percentage;

    if (current < stage1) {
      // Stage 1
      stage = 1;
      progress = current;
      maxForStage = stage1;
      percentage = Math.floor((current / stage1) * 100);
    } else if (current < stage2) {
      // Stage 2
      stage = 2;
      progress = current;
      maxForStage = stage2;
      percentage = Math.floor((current / stage2) * 100);
    } else if (current < stage3) {
      // Stage 3
      stage = 3;
      progress = current;
      maxForStage = stage3;
      percentage = Math.floor((current / stage3) * 100);
    } else {
      // Completed all stages
      stage = "Complete";
      progress = current;
      maxForStage = total;
      percentage = 100;
    }

    return {
      status: `Stage ${stage} | ${percentage}% of ${maxForStage.toLocaleString()}`,
      description: `Stage ${stage}\n${progress.toLocaleString()}/${maxForStage.toLocaleString()} (${percentage}%)\nTotal: ${current.toLocaleString()}/${total.toLocaleString()}\n\n${eventUrl}`,
    };
  }

  private validateProgress(newData: EventData, lastData: EventData): boolean {
    if (lastData.current) {
      return (newData.current as number) >= (lastData.current as number);
    }
    return true;
  }
}

export default EventBloodshedBileweavers;
