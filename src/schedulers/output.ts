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

  public constructor (config : Config, sender : DiscordUtils) {
    this.config = config;
    this.sender = sender;
    this.cronJob = new CronJob(
      config.getCron(), 
      this.run, 
      undefined, 
      undefined, 
      "UTC", 
      this,
      true
    );
    this.cronJob.start()
    console.log(`Starting new Output for ${config.getChannelId()} on interval ${config.getCron()}`);
  }

  private async run() {
    // Check most recent message ID
    let newestMessageId = await this.sender.getMostRecentMessageId(this.config.getChannelId());
    if(newestMessageId !== this.config.getLastMessageId() && this.config.getLastMessageId() !== "") {
      // If our message is not most recent, delete it and reset our local ID to be ""
      await this.sender.deleteMessage(this.config.getChannelId(), this.config.getLastMessageId());
      this.config.setLastMessageId("");
    }
    // Run compileAndSend
    await this.compileAndSend();
  }

  private async compileAndSend() {
    let newMessage = await this.buildMessage();
    if(this.config.getLastMessageId() === "") {

      let newMessageId = await this.sender.sendEmbeds(this.config.getChannelId(), [newMessage]);
      if(newMessageId) this.config.setLastMessageId(newMessageId);
      console.log(`New message ${this.config.getLastMessageId()} sent to ${this.config.getChannelId()} at ${new Date()}`);
    } else {
      await this.sender.updateMessage(this.config.getChannelId(), this.config.getLastMessageId(), [newMessage]);
      console.log(`Update for ${this.config.getLastMessageId()} sent to ${this.config.getChannelId()} at ${new Date()}`);
    }
  }

  private async buildMessage() {
    let gameServer = new GameUtils();

    // Setup default fields / scaffold message
    let returnEmbed = new MessageEmbed()
      .setColor('#3e9275')
      .setTimestamp();

    // Setup title
    returnEmbed.setTitle(`${this.config.getMode().charAt(0).toUpperCase() + this.config.getMode().slice(1)} Server Info`);

    // Setup image if provided
    if(this.config.getImage() !== "") returnEmbed.setThumbnail(this.config.getImage());

    // Setup default embed content
    let gameInfoField = `**Server:** \`${this.config.getGameServerHostname()}\`\n`;

    // Fetch gamedig data for the server
    try {
      // Fetch data
      let data = await gameServer.getQuery(this.config.getMode(), this.config.getGameServerHostname());
      // Populate fields in message for data
      gameInfoField += `**Status:** \u200B\u200B\u200B` + `:green_circle:\n`;
      gameInfoField += `**Players:** ${data.players.length}/${data.maxplayers}\n`;
      gameInfoField += `**Ping:** ${data.ping}\n`;
      if(this.config.getNotes() !== "") gameInfoField += `\n**Notes:** ${this.config.getNotes()}\n`;
    } catch (error) {
      // Populate fields in message for data
      gameInfoField += `**Status:** :red_circle:\n`;
      // Log error
      console.error(`Host ${this.config.getGameServerHostname()} is not responding to queries for ${this.config.getMode()} in channel ${this.config.getChannelId()}`);
    }

    // Build embed for discord with the data
    let messageEmbed = { name: '\u200b', value: `${gameInfoField}` };
    returnEmbed.addFields(messageEmbed);

    // Return the embed
    return returnEmbed;
  }

}