import { Client, Events, GatewayIntentBits, ActivityType } from "discord.js";

const eventData = {
  slug: process.env.HUNT_EVENT_SLUG,
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

async function event_bloodshed_bileweavers() {
  console.log("Event: Bloodshed Bileweavers");

  const eventUrl = `https://www.huntshowdown.com/community/bloodshed-bileweavers`;

  const html = await (await fetch(eventUrl)).text();

  // extract data
  const currentKills = html.match(/let\s+getCurrentKills\s*=\s*(\d+)/);
  const totalKills = html.match(/TOTAL_KILLS\s*=\s*(\d+)/);
  const stage1Max = html.match(/STAGE_1_MAX\s*=\s*(\d+)/);
  const stage2Max = html.match(/STAGE_2_MAX\s*=\s*(\d+)/);
  const stage3Max = html.match(/STAGE_3_MAX\s*=\s*(\d+)/);

  const current = parseInt(currentKills[1]);
  const total = parseInt(totalKills[1]);
  const stage1 = parseInt(stage1Max[1]);
  const stage2 = parseInt(stage2Max[1]);
  const stage3 = parseInt(stage3Max[1]);

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

// event function mapping
const eventFunctions = {
  bloodshed_bileweavers: event_bloodshed_bileweavers,
  // add future events here
  // example: another_event: event_another_event,
};

client.on(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const updateServerStatus = async () => {
    const eventFunction = eventFunctions[eventData.slug];
    if (!eventFunction) {
      console.error(`Event function not found for: ${eventData.slug}`);
      return;
    }

    const { status, description } = await eventFunction();
    client.user.setActivity({
      name: status,
      type: ActivityType.Custom,
    });

    client.application.edit({
      description: description,
    });
  };

  // Set initial status
  updateServerStatus();

  // Update status every 15 minutes
  setInterval(updateServerStatus, 900000);
});

client.login(process.env.DISCORD_TOKEN);
