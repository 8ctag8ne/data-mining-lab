// utils/csvWriter.ts
import fs from 'node:fs';
import path from 'node:path';
import { UserDatasetRecord } from '../models/userDataset';

export class CsvWriter {
  private readonly filePath: string;
  private headerWritten: boolean = false;

  constructor(filePath: string) {
    this.filePath = filePath;
    
    // Створюємо директорію якщо не існує
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Записує заголовки CSV файлу
   */
  private writeHeader(): void {
    const headers = [
      'user_id',
      'nickname',
      'loccountrycode',
      'total_playtime',
      'game_count_nonzero',
      'average_playtime',
      'median_playtime',
      'top_5_games',
      'top_5_playtimes',
      'favorite_scale',
      'scale_indie_count',
      'scale_aa_count',
      'scale_aaa_count',
      'favorite_genre_by_time',
      'favorite_genre_by_count',
      'genre_shannon_index',
      'genre_distribution',
      'favorite_tags',
      'tag_weights',
    ].join(',');

    fs.writeFileSync(this.filePath, headers + '\n', { encoding: 'utf8' });
    this.headerWritten = true;
  }

  /**
   * Конвертує значення в CSV-безпечний формат
   */
  private escapeValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (Array.isArray(value)) {
      // Масиви перетворюємо в JSON
      const jsonStr = JSON.stringify(value);
      return `"${jsonStr.replace(/"/g, '""')}"`;
    }

    if (typeof value === 'object') {
      // Об'єкти перетворюємо в JSON
      const jsonStr = JSON.stringify(value);
      return `"${jsonStr.replace(/"/g, '""')}"`;
    }

    const stringValue = String(value);
    
    // Якщо містить кому, лапки або перенос рядка - обгортаємо в лапки
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  /**
   * Додає запис до CSV файлу
   */
  async appendRecord(record: UserDatasetRecord): Promise<void> {
    if (!this.headerWritten) {
      this.writeHeader();
    }

    const row = [
      this.escapeValue(record.user_id),
      this.escapeValue(record.nickname),
      this.escapeValue(record.loccountrycode),
      this.escapeValue(record.total_playtime),
      this.escapeValue(record.game_count_nonzero),
      this.escapeValue(record.average_playtime),
      this.escapeValue(record.median_playtime),
      this.escapeValue(record.top_5_games),
      this.escapeValue(record.top_5_playtimes),
      this.escapeValue(record.favorite_scale),
      this.escapeValue(record.scale_distribution.Indie),
      this.escapeValue(record.scale_distribution.AA),
      this.escapeValue(record.scale_distribution.AAA),
      this.escapeValue(record.favorite_genre_by_time),
      this.escapeValue(record.favorite_genre_by_count),
      this.escapeValue(record.genre_shannon_index),
      this.escapeValue(record.genre_distribution),
      this.escapeValue(record.favorite_tags),
      this.escapeValue(record.tag_weights),
    ].join(',');

    fs.appendFileSync(this.filePath, row + '\n', { encoding: 'utf8' });
  }

  /**
   * Додає масив записів до CSV файлу
   */
  async appendRecords(records: UserDatasetRecord[]): Promise<void> {
    for (const record of records) {
      await this.appendRecord(record);
    }
  }

  /**
   * Очищає файл (видаляє якщо існує)
   */
  clear(): void {
    if (fs.existsSync(this.filePath)) {
      fs.unlinkSync(this.filePath);
      this.headerWritten = false;
    }
  }

  /**
   * Перевіряє чи існує файл
   */
  exists(): boolean {
    return fs.existsSync(this.filePath);
  }
}

// Приклад використання:
// const csvWriter = new CsvWriter('./output/dataset.csv');
// csvWriter.clear(); // Очищаємо старий файл якщо потрібно
//
// const record = new UserDatasetRecord(...);
// await csvWriter.appendRecord(record);