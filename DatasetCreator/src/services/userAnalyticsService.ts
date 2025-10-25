// services/userAnalyticsService.ts
import { SteamUser, SteamGame } from '../models/steamModels';
import { UserDatasetRecord } from '../models/userDataset';

export class UserAnalyticsService {
  /**
   * Створює запис датасету з користувача
   */
  createDatasetRecord(user: SteamUser): UserDatasetRecord | null {
    const games = user.ownedGames || [];
    
    // Фільтруємо ігри з ненульовим часом
    const gamesWithPlaytime = games.filter(
      (g: any) => (g.playtime_forever || 0) > 0
    );

    if (gamesWithPlaytime.length === 0) {
      return null; // Немає ігор з часом - пропускаємо
    }

    // Конвертуємо хвилини в години
    const playtimesInHours = gamesWithPlaytime.map(
      (g: any) => Math.round((g.playtime_forever || 0) / 60)
    );

    return new UserDatasetRecord(
      user.steamid,
      user.personaname || 'Unknown',
      user.loccountrycode || 'Unknown',
      this.calculateTotalPlaytime(playtimesInHours),
      gamesWithPlaytime.length,
      this.calculateAveragePlaytime(playtimesInHours),
      this.calculateMedianPlaytime(playtimesInHours),
      this.getTop5Games(gamesWithPlaytime),
      this.getTop5Playtimes(gamesWithPlaytime),
      this.getFavoriteScale(gamesWithPlaytime),
      this.getScaleDistribution(gamesWithPlaytime),
      this.getFavoriteGenreByTime(gamesWithPlaytime),
      this.getFavoriteGenreByCount(gamesWithPlaytime),
      this.calculateGenreShannonIndex(gamesWithPlaytime),
      this.getGenreDistribution(gamesWithPlaytime),
      this.getFavoriteTags(gamesWithPlaytime),
      this.getTagWeights(gamesWithPlaytime)
    );
  }

  // ===== Базові розрахунки =====

  private calculateTotalPlaytime(playtimesInHours: number[]): number {
    return playtimesInHours.reduce((sum, hours) => sum + hours, 0);
  }

  private calculateAveragePlaytime(playtimesInHours: number[]): number {
    if (playtimesInHours.length === 0) return 0;
    const total = this.calculateTotalPlaytime(playtimesInHours);
    return Math.round((total / playtimesInHours.length) * 10) / 10;
  }

  private calculateMedianPlaytime(playtimesInHours: number[]): number {
    if (playtimesInHours.length === 0) return 0;
    
    const sorted = [...playtimesInHours].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return Math.round(((sorted[mid - 1]! + sorted[mid]!) / 2) * 10) / 10;
    }
    return sorted[mid]!;
  }

  // ===== Топ-5 ігор =====

  private getTop5Games(games: any[]): string[] {
    return games
      .toSorted((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0))
      .slice(0, 5)
      .map((g) => g.name || `App ${g.appid}`);
  }

  private getTop5Playtimes(games: any[]): number[] {
    return games
      .toSorted((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0))
      .slice(0, 5)
      .map((g) => Math.round((g.playtime_forever || 0) / 60));
  }

  // ===== Масштаб ігор =====

  private parseOwners(ownersString?: string): number {
    if (!ownersString) return 0;
    
    // "5,000,000 .. 10,000,000" -> беремо верхню межу
    const match = ownersString.match(/[\d,]+\s*\.\.\s*([\d,]+)/);
    if (match) {
      return Number.parseInt(match[1]!.replaceAll(',', ''));
    }
    
    // Якщо формат інший, пробуємо взяти число
    const numMatch = ownersString.match(/[\d,]+/);
    if (numMatch) {
      return Number.parseInt(numMatch[0].replaceAll(',', ''));
    }
    
    return 0;
  }

  private getGameScale(game: any): string {
    const owners = this.parseOwners(game.owners);

    if(game.genres?.includes('Indie')) return 'Indie';
    
    if (owners < 100000) return 'Indie';
    if (owners < 1000000) return 'AA';
    return 'AAA';
  }

  private getFavoriteScale(games: any[]): string {
    const scalePlaytime: Record<string, number> = {
      Indie: 0,
      AA: 0,
      AAA: 0,
    };

    games.forEach((game) => {
      const scale = this.getGameScale(game);
      scalePlaytime[scale] += game.playtime_forever || 0;
    });

    return Object.entries(scalePlaytime).sort((a, b) => b[1] - a[1])[0]![0];
  }

  private getScaleDistribution(games: any[]): {
    Indie: number;
    AA: number;
    AAA: number;
  } {
    const distribution = { Indie: 0, AA: 0, AAA: 0 };

    games.forEach((game) => {
      const scale = this.getGameScale(game);
      distribution[scale as keyof typeof distribution]++;
    });

    return distribution;
  }

  // ===== Жанри =====

  private getFavoriteGenreByTime(games: any[]): string {
    const genrePlaytime: Record<string, number> = {};

    games.forEach((game) => {
      const genres = game.genres || [];
      const playtime = game.playtime_forever || 0;
      
      genres.forEach((genre: string) => {
        const trimmedGenre = genre.trim();
        genrePlaytime[trimmedGenre] = (genrePlaytime[trimmedGenre] || 0) + playtime;
      });
    });

    if (Object.keys(genrePlaytime).length === 0) return 'Unknown';

    return Object.entries(genrePlaytime).sort((a, b) => b[1] - a[1])[0]![0];
  }

  private getFavoriteGenreByCount(games: any[]): string {
    const genreCount: Record<string, number> = {};

    games.forEach((game) => {
      const genres = game.genres || [];
      
      genres.forEach((genre: string) => {
        const trimmedGenre = genre.trim();
        genreCount[trimmedGenre] = (genreCount[trimmedGenre] || 0) + 1;
      });
    });

    if (Object.keys(genreCount).length === 0) return 'Unknown';

    return Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]![0];
  }

  private getGenreDistribution(games: any[]): Record<string, number> {
    const genreCount: Record<string, number> = {};

    games.forEach((game) => {
      const genres = game.genres || [];
      
      genres.forEach((genre: string) => {
        const trimmedGenre = genre.trim();
        if(trimmedGenre !== ""){
            genreCount[trimmedGenre] = (genreCount[trimmedGenre] || 0) + 1;
        }
      });
    });

    return genreCount;
  }

  private calculateGenreShannonIndex(games: any[]): number {
    const genrePlaytime: Record<string, number> = {};
    let totalPlaytime = 0;

    games.forEach((game) => {
      const genres = game.genres || [];
      const playtime = game.playtime_forever || 0;
      totalPlaytime += playtime;
      
      genres.forEach((genre: string) => {
        const trimmedGenre = genre.trim();
        genrePlaytime[trimmedGenre] = (genrePlaytime[trimmedGenre] || 0) + playtime;
      });
    });

    if (totalPlaytime === 0) return 0;

    let shannonIndex = 0;
    Object.values(genrePlaytime).forEach((playtime) => {
      const p = playtime / totalPlaytime;
      if (p > 0) {
        shannonIndex -= p * Math.log(p);
      }
    });

    return Math.round(shannonIndex * 100) / 100;
  }

  // ===== Теги =====

  private getFavoriteTags(games: any[]): string[] {
    const tagWeights = this.getTagWeights(games);
    
    return Object.entries(tagWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map((entry) => entry[0]);
  }

    private getTagWeights(games: any[]): Record<string, number> {
    const tagWeights: Record<string, number> = {};
    const totalPlaytime = games.reduce(
        (sum, g) => sum + (g.playtime_forever || 0),
        0
    );

    if (totalPlaytime === 0) return {};

    games.forEach((game) => {
        const tags = game.topTags || [];
        const playtime = game.playtime_forever || 0;
        const weight = playtime / totalPlaytime;

        tags.forEach((tag: string) => {
        tagWeights[tag] = (tagWeights[tag] || 0) + weight;
        });
    });

    // Округлюємо ваги та видаляємо нульові
    const filteredWeights: Record<string, number> = {};
    Object.keys(tagWeights).forEach((tag) => {
        const roundedWeight = Math.round(tagWeights[tag]! * 100) / 100;
        if (roundedWeight > 0) {
        filteredWeights[tag] = roundedWeight;
        }
    });

    return filteredWeights;
    }
}

// Приклад використання:
// const analyticsService = new UserAnalyticsService();
// const user = await mongoService.getUserBySteamId('76561198012345678');
// if (user && user.ownedGames) {
//   const datasetRecord = analyticsService.createDatasetRecord(user);
//   if (datasetRecord) {
//     console.log(datasetRecord.toObject());
//   }
// }