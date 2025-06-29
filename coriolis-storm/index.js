import { Client, Events, GatewayIntentBits, ActivityType } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ]
});

function getNextStormDate() {
  const now = new Date();
  
  // Otherwise calculate next Tuesday at 4 AM MT
  const nextTuesday = new Date(now);
  
  // Convert to MT by adjusting for timezone offset
  const mtOffset = -6; // MDT offset from UTC
  const localOffset = nextTuesday.getTimezoneOffset() / 60;
  const offsetDiff = localOffset + mtOffset;
  
  // Set to next 4 AM MT (which might be a different hour locally)
  nextTuesday.setHours(4 - offsetDiff, 0, 0, 0);
  
  // If it's past 4 AM MT today, move to tomorrow
  const mtHour = (now.getHours() + offsetDiff) % 24;
  if (mtHour >= 4) {
    nextTuesday.setDate(nextTuesday.getDate() + 1);
  }
  
  // Get days until next Tuesday (Tuesday is 2 in JS)
  const daysUntilTuesday = (2 + 7 - nextTuesday.getDay()) % 7;
  nextTuesday.setDate(nextTuesday.getDate() + daysUntilTuesday);
  
  return nextTuesday;
}

client.on(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
  
  const updateTimer = async () => {
    const now = new Date();
    const nextStorm = getNextStormDate();
    const timeLeft = nextStorm - now;
    
    // Calculate days, hours, minutes, and seconds
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    const countdownText = `Apex in ${days}d ${hours}h ${minutes}m ${seconds}s`;
    
    client.user.setActivity({ 
      name: countdownText,
      type: ActivityType.Custom,
    });
  };
  
  // Set initial status
  updateTimer();
  
  // Update every 15 seconds
  setInterval(updateTimer, 15000);
});

client.login(process.env.DISCORD_TOKEN);