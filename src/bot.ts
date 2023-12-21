import { Client } from 'discord.js'
import * as dotenv from 'dotenv'
import * as fs from 'fs';
import path from 'path'
import ready from './hooks/ready'
import tearDown from './hooks/tearDown'
import { Output } from './schedulers/output'
import { Config } from './classes/config';
import { DiscordUtils } from './utils/discordUtils';

dotenv.config({ path: path.resolve('./.env') })
const token = process.env.DSCRD_BOT_TK

console.log('Bot is starting...')

const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_MESSAGE_REACTIONS']
})

// Setup Discord
ready(client)
client.login(token)
let discordUtils = new DiscordUtils(client);

// If file is provided ensure it exists
const configFile = process.env.CONFIG_FILE!
if(!fs.existsSync(configFile)) {
  console.error('Config file does not exist')
  process.exit(1)
}

let configs : Config[] = [];

// Read and process config file
fs.readFile(configFile, 'utf8', (err, data) => {
  if (err) {
    console.error(err)
    return
  }

  // Parse text as JSON
  let config = JSON.parse(data);
  
  // Loop through JSOn as array
  config.forEach((element: any) => {

      // Build JSON element into Config object
      let config : Config = new Config();
      config.setGameServerHostname(element.host);
      config.setGameServerPort(element.port ? element.port : undefined);
      config.setChannelId(element.channelId);
      config.setMode(element.mode);
      config.setImage(element.image);
      config.setNotes(element.notes);

      // Set cron or default
      let resolveCron = element.cronRegex ? element.cronRegex : "*/5 * * * * *";
      config.setCron(resolveCron);

      // Log we received the config
      console.log(`Received a config: ${JSON.stringify(config)}`);
      configs.push(config);

      // Create new Output scheduler
      new Output(config, discordUtils);
  });
});

// When ready, delete the system
tearDown(discordUtils, configs)