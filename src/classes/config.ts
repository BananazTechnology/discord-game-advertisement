export class Config {
  // User attributes. Should always be private as updating information will need to be reflected in the db
  private cronRegex?: string;
  private gameServerHostname?: string;
  private gameServerPort?: number;
  private channelId?: string;
  private mode?: string;
  private image?: string;
  private notes?: string;
  private lastMessageId?: string;

  public constructor (cronRegex?: string, gameServerHostname?: string, channelId?: string, mode?: string) {
    this.cronRegex = cronRegex;
    this.gameServerHostname = gameServerHostname;
    this.channelId = channelId;
    this.mode = mode;
  }

  // Getters
  public getCron () : string {
    return this.cronRegex ? this.cronRegex : "";
  }

  public getGameServerHostname () : string {
    return this.gameServerHostname ? this.gameServerHostname : "";
  }

  public getGameServerPort () : number {
    return this.gameServerPort ? this.gameServerPort : 0;
  }

  public getChannelId () : string {
    return this.channelId ? this.channelId : "";
  }

  public getMode () : string {
    return this.mode ? this.mode : "";
  }

  public getImage () : string {
    return this.image ? this.image : "";
  }

  public getNotes () : string {
    return this.notes ? this.notes : "";
  }

  public getLastMessageId () : string {
    return this.lastMessageId ? this.lastMessageId : "";
  }

  // Setters
  public setCron (cronRegex: string) {
    this.cronRegex = cronRegex;
  }

  public setGameServerHostname (gameServerHostname: string) {
    this.gameServerHostname = gameServerHostname;
  }

  public setGameServerPort (gameServerPort: number) {
    this.gameServerPort = gameServerPort;
  }

  public setChannelId (channelId: string) {
    this.channelId = channelId;
  }

  public setMode (mode: string) {
    this.mode = mode;
  }

  public setImage (image: string) {
    this.image = image;
  }

  public setNotes (notes: string) {
    this.notes = notes;
  }

  public setLastMessageId (lastMessageId: string) {
    this.lastMessageId = lastMessageId;
  }

}
