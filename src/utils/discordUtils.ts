import { Client, MessageEmbed, MessageEmbedOptions, TextChannel } from 'discord.js'
import { EventMessage } from '../classes/eventMessage';

export class DiscordUtils {
  // User attributes. Should always be private as updating information will need to be reflected in the db
  private discord : Client;

  public constructor (discord : Client) {
    this.discord = discord;
  }

  public async sendEmbeds(channelId : string, embeds : (MessageEmbed | MessageEmbedOptions)[]) {
    if (!this.discord.readyAt) return null;
    const channel = await this.discord.channels.fetch(channelId);
    // Using a type guard to narrow down the correct type
    if (!((channel): channel is TextChannel => channel?.type === 'GUILD_TEXT')(channel)) return
    let MessageOptions = {
      embeds: embeds
    }
    const message = await channel.send(MessageOptions);
    return message.id;
  }

  public async updateMessage(channelId : string, messageId : string, embeds : (MessageEmbed | MessageEmbedOptions)[]) {
    if (!this.discord.readyAt) return null;
    const channel = await this.discord.channels.fetch(channelId);
    // Using a type guard to narrow down the correct type
    if (!((channel): channel is TextChannel => channel?.type === 'GUILD_TEXT')(channel)) return
    let MessageOptions = {
      embeds: embeds
    }
    const message = await channel.messages.fetch(messageId);
    return message.edit(MessageOptions);
  }

  public async deleteMessage(channelId : string, messageId : string) {
    if (!this.discord.readyAt) return null;
    const channel = await this.discord.channels.fetch(channelId);
    // Using a type guard to narrow down the correct type
    if (!((channel): channel is TextChannel => channel?.type === 'GUILD_TEXT')(channel)) return
    const message = await channel.messages.fetch(messageId);
    return message.delete();
  }
}