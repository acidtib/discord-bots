import { Client, Events, GatewayIntentBits, ActivityType } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ]
});

async function fetchServerStatus() {
  try {
    const response = await fetch('https://questlog.gg/dune-awakening/api/trpc/serverStatus.getServerStatus');
    const data = await response.json();
    
    const freyaServer = data.result.data.worlds.find(world => world.displayName === 'Freya');
    
    if (freyaServer) {
      return `${freyaServer.currentPlayerCount}/${freyaServer.currentMaxPlayerCount} Online, ${freyaServer.currentSietchCount} Sietches`
    }
    return 'Server status unavailable';
  } catch (error) {
    console.error('Error fetching server status:', error);
    return 'Error fetching server status';
  }
}

client.on(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
  
  // Function to update the server status
  const updateServerStatus = async () => {
    const status = await fetchServerStatus();
    client.user.setActivity({ 
      name: status,  
      type: ActivityType.Custom,
    });
  };
  
  // Set initial status
  updateServerStatus();
  
  // Update status every 11 minutes
  setInterval(updateServerStatus, 660000);
});

client.login(process.env.DISCORD_TOKEN); 