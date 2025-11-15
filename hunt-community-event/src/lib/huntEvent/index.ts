import { ActivityType } from "discord.js";
import { Logger } from '../logger'

// hunt events
import { EventDeathRites } from './deathRites';
import { EventBloodshedBileweavers } from './bloodshedBileweavers';
import { EventPlowsharesPitchforks } from './plowsharesAndPitchforks';

export class HuntEvent {

  static async execute(client) {
    // event calss mapping
    const eventClasses = {
      bloodshed_bileweavers: EventBloodshedBileweavers,
      death_rites: EventDeathRites,
      plowshares_and_pitchforks: EventPlowsharesPitchforks,
      // add future events here
      // example: another_event: event_another_event,
    };

    const eventSlug = process.env.HUNT_EVENT_SLUG;
    const eventClass = eventClasses[eventSlug];

    if (!eventClass) {
      Logger.error(`Event function not found for: ${eventSlug}`);
      return;
    }

    const { status, description } = await eventClass.track(client);

    client.user.setActivity({
      name: status,
      type: ActivityType.Custom,
    });

    client.application.edit({
      description: description,
    });
  }
}

export default HuntEvent;
