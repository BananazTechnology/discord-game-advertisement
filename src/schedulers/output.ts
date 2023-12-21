import { EventMessage } from '../classes/eventMessage';
import { Config } from '../classes/config';
import { CronJob } from 'cron';
import { DiscordUtils } from '../utils/discordUtils';
import { GameUtils } from '../utils/gameUtils';
import { MessageEmbed, EmbedFieldData } from 'discord.js';

export class Output {
  private config : Config;
  private sender : DiscordUtils;
  private cronJob: CronJob;
  private checkForForgottenMsgs : boolean = false;

  public constructor (config : Config, sender : DiscordUtils) {
    this.config = config;
    this.sender = sender;
    this.cronJob = new CronJob(
      config.getCron(), 
      this.run, 
      undefined, 
      undefined, 
      "UTC", 
      this
    );
    this.cronJob.start()
    console.log(`Starting new Output for ${config.getChannelId()} on interval ${config.getCron()}`);
  }

  private async run() {
    if(!this.checkForForgottenMsgs) {
      await this.discordCleanupForgottenMessages();
      this.checkForForgottenMsgs = true;
    }
    await this.discordRefreshMessageLogic();
    await this.discordAdMessageLogic();
  }

  // This function catches undeleted messages in the channel cleans them up
  private async discordCleanupForgottenMessages() {
    console.log(`Checking for forgotten messages in ${this.config.getChannelId()}`);
    // Setup variables
    let conf = this.config;
    let send = this.sender;
    // Get last 25 messages
    let messages = await send.getMessages(conf.getChannelId(), 25);
    // If any messages are from our bot, delete them
    let ourBot = await send.getBotUser();
    let count = 0;
    if (messages && ourBot) {
      for (const message of messages.values()) {
        console.log(`Checking message ${JSON.stringify(message)}`);
        if (message.author.id === ourBot.id) {
          await send.deleteMessage(conf.getChannelId(), message.id);
          count++;
        }
      }
    }    
    console.log(`Deleted ${count} forgotten messages in ${this.config.getChannelId()}`);
  }

  // This function ensures our bot message is always at the bottom of the channel
  private async discordRefreshMessageLogic() {
    // Setup variables
    let conf = this.config;
    let send = this.sender;
    // Check most recent message ID
    let newestMessage = await send.getMostRecentMessage(conf.getChannelId());
    let botUser = await send.getBotUser();
    // Ensure values are set
    if(newestMessage && botUser) {
      // Our bot message is only deleted and refreshed if: 
      // Remember we want our bot to always float to the bottom so if its not the bottom we must destroy our message and resend
      // ((Last message id is not our bots message) && (our bot has send a message) && (we didnt write the last message))
          // We want our message to be on the bottom so if the last message id is not ours we need to refresh
          // We must ensure we dont try to delete a message we know we didnt send, so we check if we have sent a message
          // We must ensure we dont delete our own message, so we check if the last message was sent by us (added to support multiple bots)
      if((newestMessage.id !== conf.getLastMessageId()) && (conf.getLastMessageId() !== "") && (newestMessage.author.id !== botUser.id)) {
        // If our message is not most recent, delete it and reset our local ID to be ""
        await send.deleteMessage(conf.getChannelId(), conf.getLastMessageId());
        conf.setLastMessageId("");
      }
    }
  }

  // Simple function to send the Ad message or update it
  private async discordAdMessageLogic() {
    // Setup variables
    let conf = this.config;
    let send = this.sender;
    let newMessage = await this.buildDiscordEmbed();
    // Check if we have sent a message or if this first start
    if(conf.getLastMessageId() === "") {
      let newMessageId = await send.sendEmbeds(conf.getChannelId(), [newMessage]);
      if(newMessageId) {
        conf.setLastMessageId(newMessageId);
        console.log(`New message ${conf.getLastMessageId()} sent to ${conf.getChannelId()} at ${new Date()}`);
      }
    } else { // Block runs on message updates
      await send.updateMessage(conf.getChannelId(), conf.getLastMessageId(), [newMessage]);
      console.log(`Update for ${conf.getLastMessageId()} sent to ${conf.getChannelId()} at ${new Date()}`);
    }
  }

  private async buildDiscordEmbed() {
    // Setup variables
    let conf = this.config;
    let gameServer = new GameUtils();

    // Setup default fields / scaffold message
    let returnEmbed = new MessageEmbed()
      .setColor('#3e9275')
      .setTimestamp();

    // Setup title
    returnEmbed.setTitle(`${conf.getMode().charAt(0).toUpperCase() + conf.getMode().slice(1)} Server Info`);

    // Setup image if provided
    if(conf.getImage() !== "") returnEmbed.setThumbnail(conf.getImage());

    // Setup default embed content
    let gameInfoField = `**Server:** \`${conf.getGameServerHostname()}\`\n`;

    // Fetch gamedig data for the server
    try {
      // Fetch data
      let data = await gameServer.getQuery(conf.getMode(), conf.getGameServerHostname(), conf.getGameServerPort());
      // Populate fields in message for data
      gameInfoField += `**Status:** \u200B\u200B\u200B` + `:green_circle:\n`;
      gameInfoField += `**Players:** ${data.players.length}/${data.maxplayers}\n`;
      gameInfoField += `**Ping:** ${data.ping}\n`;
      if(conf.getNotes() !== "") gameInfoField += `\n**Notes:** ${conf.getNotes()}\n`;
    } catch (error) {
      // Populate fields in message for data
      gameInfoField += `**Status:** :red_circle:\n`;
      // Log error
      console.error(`Host ${conf.getGameServerHostname()} is not responding to queries for ${conf.getMode()} in channel ${conf.getChannelId()}`);
    }

    // Build embed for discord with the data
    let messageEmbed = { name: '\u200b', value: `${gameInfoField}` };
    returnEmbed.addFields(messageEmbed);

    // Return the embed
    return returnEmbed;
  }

}