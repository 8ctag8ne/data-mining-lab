// services/datasetCreatorService.ts
import { MongoDbService } from './databaseService';
import { UserAnalyticsService } from './userAnalyticsService';
import { CsvWriter } from '../utils/csvWriter';

export class DatasetCreatorService {
  constructor(
    private readonly mongoService: MongoDbService,
    private readonly analyticsService: UserAnalyticsService,
    private readonly csvWriter: CsvWriter
  ) {}

  /**
   * Створює датасет з усіх користувачів у БД
   */
  async createDataset(): Promise<void> {
    console.log('Starting dataset creation...');
    
    // Очищаємо старий файл
    this.csvWriter.clear();
    
    let processedCount = 0;
    let savedCount = 0;
    let skippedCount = 0;

    try {
      // Отримуємо всіх користувачів
      const users = await this.mongoService.getAllUsers();
      console.log(`Found ${users.length} users in database\n`);

      for (const user of users) {
        try {
          processedCount++;

          // Перевіряємо чи є ігри
          if (!user.ownedGames || user.ownedGames.length === 0) {
            skippedCount++;
            console.log(
              `[${processedCount}/${users.length}] Skipped ${user.steamid} - no games`
            );
            continue;
          }

          // Створюємо запис датасету
          const datasetRecord = this.analyticsService.createDatasetRecord(user);

          if (!datasetRecord) {
            skippedCount++;
            console.log(
              `[${processedCount}/${users.length}] Skipped ${user.steamid} - no playtime`
            );
            continue;
          }

          // Зберігаємо в CSV
          await this.csvWriter.appendRecord(datasetRecord);
          savedCount++;

          console.log(
            `[${processedCount}/${users.length}] ✓ Processed ${user.steamid} (${user.personaname})`
          );
        } catch (error) {
          console.error(
            `[${processedCount}/${users.length}] ✗ Error processing user ${user.steamid}:`,
            error
          );
        }
      }

      console.log('\n=== Dataset creation complete! ===');
      console.log(`Total users: ${users.length}`);
      console.log(`Processed: ${processedCount}`);
      console.log(`Saved to CSV: ${savedCount}`);
      console.log(`Skipped: ${skippedCount}`);
    } catch (error) {
      console.error('Fatal error during dataset creation:', error);
      throw error;
    }
  }
}

// Приклад використання:
// const mongoService = new MongoDbService('mongodb://localhost:27017', 'steam_db');
// await mongoService.connect();
//
// const analyticsService = new UserAnalyticsService();
// const csvWriter = new CsvWriter('./output/steam_dataset.csv');
// const datasetCreator = new DatasetCreatorService(mongoService, analyticsService, csvWriter);
//
// await datasetCreator.createDataset();
// await mongoService.close();