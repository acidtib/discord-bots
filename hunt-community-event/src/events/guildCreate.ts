import { Events } from 'discord.js';

export default {
	name: Events.GuildCreate,
	async execute(guild: any) {
		try {
      console.log(`Joined a new guild: ${guild.name} - ${guild.id}`);

      const owner = await guild.fetchOwner();

      // Then create/update the guild

      console.log(`Successfully processed guild: ${guild.name}`);
    } catch (error) {
      console.error(`Error processing guild ${guild.id}, ${guild.name}:`, error);
    }
	},
};
