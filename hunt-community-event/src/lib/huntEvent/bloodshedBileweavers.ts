import Logger from "../logger";

export class EventBloodshedBileweavers {

  static async track() {
    Logger.info("Event: Bloodshed Bileweavers");

    const eventUrl = "https://www.huntshowdown.com/community/bloodshed-bileweavers";

    const html = await (await fetch(eventUrl)).text();

    // extract data
    const current = html.match(/let\s+getCurrentKills\s*=\s*(\d+)/)[1];
    const total = html.match(/TOTAL_KILLS\s*=\s*(\d+)/)[1];
    const stage1 = html.match(/STAGE_1_MAX\s*=\s*(\d+)/)[1];
    const stage2 = html.match(/STAGE_2_MAX\s*=\s*(\d+)/)[1];
    const stage3 = html.match(/STAGE_3_MAX\s*=\s*(\d+)/)[1];

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
      progress = current - stage1;
      maxForStage = stage2 - stage1;
      percentage = Math.floor((progress / maxForStage) * 100);
    } else if (current < stage3) {
      // Stage 3
      stage = 3;
      progress = current - stage2;
      maxForStage = stage3 - stage2;
      percentage = Math.floor((progress / maxForStage) * 100);
    } else {
      // Completed all stages
      stage = "Complete";
      progress = total;
      maxForStage = total;
      percentage = 100;
    }

    return {
      status: `Stage ${stage} | ${percentage}%/${maxForStage.toLocaleString()}`,
      description: `Stage ${stage} \n${progress.toLocaleString()}/${maxForStage.toLocaleString()} \n${eventUrl}`,
    };
  }
}

export default EventBloodshedBileweavers;
