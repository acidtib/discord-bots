import Logger from "../logger";
import { Client } from "discord.js";
import { saveEventData } from "./saveEventData";
import prisma from "../prisma";

export class EventBloodshedBileweavers {

  static async track(client?: Client) {
    Logger.info("Event: Bloodshed Bileweavers");

    const eventUrl = "https://www.huntshowdown.com/community/bloodshed-bileweavers";

    const html = await (await fetch(eventUrl)).text();

    // extract data
    const current = parseInt(html.match(/let\s+getCurrentKills\s*=\s*(\d+)/)[1]);
    const total = parseInt(html.match(/TOTAL_KILLS\s*=\s*(\d+)/)[1]);
    const stage1 = parseInt(html.match(/STAGE_1_MAX\s*=\s*(\d+)/)[1]);
    const stage2 = parseInt(html.match(/STAGE_2_MAX\s*=\s*(\d+)/)[1]);
    const stage3 = parseInt(html.match(/STAGE_3_MAX\s*=\s*(\d+)/)[1]);

    // save to EventData if the json data is different from the last saved data
    const payload = {
      current,
      total,
      stage1,
      stage2,
      stage3,
    };

    // Check if new data is less than previously saved data
    const resolvedBotId = parseInt(process.env.HUNTCET_BOT_ID || "0");
    const latest = await prisma.eventData.findFirst({
      where: { botId: resolvedBotId },
      orderBy: { createdAt: "desc" },
      select: { data: true },
    });

    if (latest && latest.data) {
      const lastData = latest.data as any;
      if (lastData.current) {
        if (payload.current < lastData.current) {
          Logger.info("Skipping update: new data is less than previous data");

          // Calculate status using previous data
          let stage, progress, maxForStage, percentage;
          if (lastData.current < lastData.stage1) {
            stage = 1;
            progress = lastData.current;
            maxForStage = lastData.stage1;
            percentage = Math.floor((lastData.current / lastData.stage1) * 100);
          } else if (lastData.current < lastData.stage1 + lastData.stage2) {
            stage = 2;
            progress = lastData.current;
            maxForStage = lastData.stage2;
            percentage = Math.floor((lastData.current / lastData.stage2) * 100);
          } else if (lastData.current < lastData.stage1 + lastData.stage2 + lastData.stage3) {
            stage = 3;
            progress = lastData.current;
            maxForStage = lastData.stage3;
            percentage = Math.floor((lastData.current / lastData.stage3) * 100);
          } else {
            stage = "Complete";
            progress = lastData.current;
            maxForStage = lastData.total;
            percentage = 100;
          }

          return {
            status: `Stage ${stage} | ${percentage}% of ${maxForStage.toLocaleString()}`,
            description: `Stage ${stage}\n${progress.toLocaleString()}/${maxForStage.toLocaleString()} (${percentage}%)\nTotal: ${lastData.current.toLocaleString()}/${lastData.total.toLocaleString()}\n\n${eventUrl}`,
          };
        }
      }
    }

    await saveEventData(payload, client);

    let stage, progress, maxForStage, percentage;
    if (current < stage1) {
      // Stage 1
      stage = 1;
      progress = current;
      maxForStage = stage1;
      percentage = Math.floor((current / stage1) * 100);
    } else if (current < stage1 + stage2) {
      // Stage 2
      stage = 2;
      progress = current;
      maxForStage = stage2;
      percentage = Math.floor((current / stage2) * 100);
    } else if (current < stage1 + stage2 + stage3) {
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
}

export default EventBloodshedBileweavers;
