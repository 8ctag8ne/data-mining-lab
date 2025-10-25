import { CsvReader } from '../utils/csvReader';
import { MongoDbService } from './databaseService';
import { delay, SteamApiService } from './steamApiService';
import { SteamUser, SteamGame, SteamGameDetails } from '../models/steamModels';

export class SteamUserProcessor {
  constructor(
    private readonly csvReader: CsvReader,
    private readonly dbService: MongoDbService,
    private readonly apiService: SteamApiService
  ) {}

  /**
   * Основна функція обробки CSV файлу
   */
  async processCsvFile(
    csvFilePath: string,
    batchSize: number = 100
  ): Promise<void> {
    let processedCount = 0;
    let validUsersCount = 0;

    for await (const steamIdBatch of this.csvReader.readSteamIdsBatches(
      csvFilePath,
      batchSize
    )) {
      console.log(`\n=== Processing batch of ${steamIdBatch.length} Steam IDs ===`);

      const validUsers = await this.filterValidUsers(steamIdBatch);
      console.log(`Valid users after filtering: ${validUsers.length}`);

      for (const user of validUsers) {
        const success = await this.processUserGames(user);
        if (success) {
          validUsersCount++;
        }

        // Затримка між запитами
        await delay(1000);
      }

      processedCount += steamIdBatch.length;
      console.log(`Progress: ${processedCount} processed, ${validUsersCount} valid`);
    }

    console.log('\n=== Processing complete! ===');
    console.log(`Total processed: ${processedCount}`);
    console.log(`Total valid users with games: ${validUsersCount}`);
  }

  /**
   * Фільтрує користувачів за критеріями
   */
  private async filterValidUsers(steamIds: string[]): Promise<SteamUser[]> {

    const users = (await this.apiService.getPlayersSummaries(steamIds))
                    .response
                    .players
                    .filter((u) => this.isUserValid(u));

    return users;
  }

  /**
   * Перевіряє чи відповідає користувач критеріям
   */
  private isUserValid(user: SteamUser): boolean {
    return (
      user?.communityvisibilitystate == 3 && 
      user?.profilestate == 1
    );
  }

  /**
   * Обробляє ігри користувача
   */
  private async processUserGames(user: SteamUser): Promise<boolean> {
    try {
      console.log(`\nProcessing user: ${user.steamid} (${user.personaname})`);

      const gamesResponse = await this.apiService.getOwnedGames(user.steamid);
      const games = gamesResponse.response.games || [];
      const gameCount = gamesResponse.response.game_count || 0;

      if (gameCount === 0 || games.length === 0) {
        console.log(`User has no games, skipping...`);
        return false;
      }

      console.log(`Found ${gameCount} games`);

      
      // Зберігаємо ігри в БД та збагачуємо їх дані
      const enrichedGames : SteamGame[] = await this.enrichAndSaveGames(games);
      user.ownedGames = enrichedGames;
      
      try {
        await this.dbService.upsertUser(user);
      }
      catch (error) {
        console.error(`Error saving user ${user.steamid}:`, error);
      }
      console.log(`[+] User processed successfully`);
      return true;
    } catch (error) {
      console.error(`[-] Error processing user ${user.steamid}:`, error);
      return false;
    }
  }

  /**
   * Збагачує дані ігор та зберігає їх в БД
   */
  private async enrichAndSaveGames(games: SteamGame[]): Promise<SteamGame[]> {
    const enrichedGames : SteamGame[] = []; 

    for (const game of games) {
      const enrichedGame = await this.enrichGameData(game);
      enrichedGames.push(enrichedGame);
      
    //   try {
    //     await this.dbService.upsertGame(game);
    //   } catch (error) {
    //     console.error(`Error saving game ${game.appid}:`, error);
    //   }
    }

    return enrichedGames;
  }

  /**
   * Заглушка для збагачення даних гри
   */
  private async enrichGameData(game: SteamGame): Promise<SteamGame> {
    const gameDetails = await this.getGameDetails(game.appid);
    game.genres = gameDetails.genre?.split(',');
    game.owners = gameDetails.owners;
    const sortedTags = Object.entries(gameDetails.tags || {}).sort((a, b) => b[1] - a[1]);
    game.topTags = sortedTags.map((tag) => tag[0]).slice(0, 5);
    return game;
  }

  private async getGameDetails(appid: number) : Promise<SteamGameDetails> {
    let gameDetails = await this.dbService.getGameByAppId(appid);
    if(!gameDetails)
    {
      gameDetails = await this.apiService.getGameDetails(appid);
      await this.dbService.createGame(gameDetails);
    }
    return gameDetails;
  }
}