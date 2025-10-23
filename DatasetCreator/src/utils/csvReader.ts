import * as fs from 'fs';
import * as readline from 'readline';

export class CsvReader {
  /**
   * Читає Steam ID з CSV файлу по рядках
   * @param filePath - шлях до CSV файлу
   * @param columnIndex - індекс колонки з Steam ID (за замовчуванням 0)
   * @param hasHeader - чи має файл заголовок (за замовчуванням true)
   */
  async *readSteamIds(
    filePath: string,
    columnIndex: number = 0,
    hasHeader: boolean = true
  ): AsyncGenerator<string> {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let isFirstLine = true;

    for await (const line of rl) {
      if (isFirstLine && hasHeader) {
        isFirstLine = false;
        continue;
      }

      const columns = line.split(',').map((col : string) => col.trim());
      const steamId = columns[columnIndex];

      if (steamId) {
        yield steamId;
      }
    }
  }

  /**
   * Читає Steam ID батчами
   */
  async *readSteamIdsBatches(
    filePath: string,
    batchSize: number = 100,
    columnIndex: number = 0,
    hasHeader: boolean = true
  ): AsyncGenerator<string[]> {
    let batch: string[] = [];

    for await (const steamId of this.readSteamIds(
      filePath,
      columnIndex,
      hasHeader
    )) {
      batch.push(steamId);

      if (batch.length === batchSize) {
        yield batch;
        batch = [];
      }
    }

    if (batch.length > 0) {
      yield batch;
    }
  }
}

// Приклад використання:
// const csvReader = new CsvReader();
// 
// // Читання по одному
// for await (const steamId of csvReader.readSteamIds('./steam_ids.csv')) {
//   console.log(steamId);
// }
//
// // Читання батчами
// for await (const batch of csvReader.readSteamIdsBatches('./steam_ids.csv', 100)) {
//   console.log(`Processing ${batch.length} Steam IDs`);
// }