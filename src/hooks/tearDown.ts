import { DiscordUtils } from '../utils/discordUtils';
import { Config } from '../classes/config';

export default (discordUtils: DiscordUtils, configs: Config[]): void => {
  const shutdownHandler = async () => {
    for(const config of configs) {
      console.log(`Deleting message ${config.getLastMessageId()} in channel ${config.getChannelId()}`);
      await discordUtils.deleteMessage(config.getChannelId(), config.getLastMessageId());
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdownHandler);
  process.on('SIGTERM', shutdownHandler);
  process.on('SIGUSR1', shutdownHandler);
  process.on('SIGUSR2', shutdownHandler);
}