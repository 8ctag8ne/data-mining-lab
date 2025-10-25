// main.ts
import { SteamApiService } from './services/steamApiService';
import { CsvReader } from './utils/csvReader';
import { MongoDbService } from './services/databaseService';
import { SteamUserProcessor } from './services/steamUserProcessor';
import { DatasetCreatorService } from './services/datasetCreatorService';
import { UserAnalyticsService } from './services/userAnalyticsService';
import { CsvWriter } from './utils/csvWriter';
import * as readline from 'readline';

async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function collectDataFromAPI() {
  const MONGO_CONNECTION =
    process.env.MONGO_CONNECTION || 'mongodb://localhost:27017';
  const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'ukrainian-steam-users';
  const STEAM_API_KEY =
    process.env.STEAM_API_KEY || '8651E72B7AB56C749DCC374586F499C4';
  const CSV_FILE_PATH = process.env.CSV_FILE_PATH || '../steam_ids.csv';
  const BATCH_SIZE = Number.parseInt(process.env.BATCH_SIZE || '100');

  console.log('\n=== MODE: Collecting data from Steam API ===\n');
  console.log('Initializing services...');

  const csvReader = new CsvReader();
  const mongoService = new MongoDbService(MONGO_CONNECTION, MONGO_DB_NAME);
  const steamService = new SteamApiService(STEAM_API_KEY);

  try {
    console.log('Connecting to MongoDB...');
    await mongoService.connect();
    console.log('Connected successfully!\n');

    const processor = new SteamUserProcessor(
      csvReader,
      mongoService,
      steamService
    );

    console.log(`Starting processing of ${CSV_FILE_PATH}...`);
    await processor.processCsvFile(CSV_FILE_PATH, BATCH_SIZE);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    console.log('\nClosing connections...');
    await mongoService.close();
    console.log('Done!');
  }
}

async function createDatasetFromDB() {
  const MONGO_CONNECTION =
    process.env.MONGO_CONNECTION || 'mongodb://localhost:27017';
  const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'ukrainian-steam-users';
  const OUTPUT_CSV_PATH =
    process.env.OUTPUT_CSV_PATH || './output/steam_dataset.csv';

  console.log('\n=== MODE: Creating dataset from database ===\n');
  console.log('Initializing services...');

  const mongoService = new MongoDbService(MONGO_CONNECTION, MONGO_DB_NAME);
  const analyticsService = new UserAnalyticsService();
  const csvWriter = new CsvWriter(OUTPUT_CSV_PATH);

  try {
    console.log('Connecting to MongoDB...');
    await mongoService.connect();
    console.log('Connected successfully!\n');

    const datasetCreator = new DatasetCreatorService(
      mongoService,
      analyticsService,
      csvWriter
    );

    console.log(`Creating dataset at ${OUTPUT_CSV_PATH}...`);
    await datasetCreator.createDataset();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    console.log('\nClosing connections...');
    await mongoService.close();
    console.log('Done!');
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('Steam User Data Processing Tool');
  console.log('='.repeat(50));

  const mode = await promptUser(
    '\nSelect mode:\n  1) Collect data from Steam API\n  2) Create CSV dataset from database\n\nEnter choice (1 or 2): '
  );

  if (mode === '1' || mode === 'collect' || mode === 'api') {
    await collectDataFromAPI();
  } else if (mode === '2' || mode === 'dataset' || mode === 'csv') {
    await createDatasetFromDB();
  } else {
    console.error('Invalid choice. Please enter 1 or 2.');
    process.exit(1);
  }
}

main().catch(console.error);