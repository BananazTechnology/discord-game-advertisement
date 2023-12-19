import GameDig from 'gamedig';

export class GameUtils {
  public async getQuery(game: string, host: string) {
    try {
      const queryOptions = {
        type: game as GameDig.Type,
        host: host
      };

      const result = await GameDig.query(queryOptions);
      return result;
    } catch (error) {
      console.error('Failed to gamedig fetch:', error);
      throw error;
    }
  }
}