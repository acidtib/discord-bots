import { ActivityType } from "discord.js";
import { EventDeathRites } from './deathRites';
import { Logger } from '../logger'

export class HuntEvent {

  static async execute(client) {
    // event calss mapping
    const eventClasses = {
      // bloodshed_bileweavers: event_bloodshed_bileweavers,
      death_rites: EventDeathRites,
      // add future events here
      // example: another_event: event_another_event,
    };

    const eventSlug = process.env.HUNT_EVENT_SLUG;
    const eventClass = eventClasses[eventSlug];

    if (!eventClass) {
      Logger.error(`Event function not found for: ${eventSlug}`);
      return;
    }

    const { status, description } = await eventClass.track();

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
