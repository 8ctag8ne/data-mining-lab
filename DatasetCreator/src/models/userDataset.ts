// models/userDataset.ts
export class UserDatasetRecord {
  constructor(
    public user_id: string,
    public nickname: string,
    public loccountrycode: string,
    public total_playtime: number,
    public game_count_nonzero: number,
    public average_playtime: number,
    public median_playtime: number,
    public top_5_games: string[],
    public top_5_playtimes: number[],
    public favorite_scale: string,
    public scale_distribution: { Indie: number; AA: number; AAA: number },
    public favorite_genre_by_time: string,
    public favorite_genre_by_count: string,
    public genre_shannon_index: number,
    public genre_distribution: Record<string, number>,
    public favorite_tags: string[],
    public tag_weights: Record<string, number>
  ) {}

  static fromObject(obj: any): UserDatasetRecord {
    return new UserDatasetRecord(
      obj.user_id,
      obj.nickname,
      obj.loccountrycode,
      obj.total_playtime,
      obj.game_count_nonzero,
      obj.average_playtime,
      obj.median_playtime,
      obj.top_5_games,
      obj.top_5_playtimes,
      obj.favorite_scale,
      obj.scale_distribution,
      obj.favorite_genre_by_time,
      obj.favorite_genre_by_count,
      obj.genre_shannon_index,
      obj.genre_distribution,
      obj.favorite_tags,
      obj.tag_weights
    );
  }

  toObject(): any {
    return {
      user_id: this.user_id,
      nickname: this.nickname,
      loccountrycode: this.loccountrycode,
      total_playtime: this.total_playtime,
      game_count_nonzero: this.game_count_nonzero,
      average_playtime: this.average_playtime,
      median_playtime: this.median_playtime,
      top_5_games: this.top_5_games,
      top_5_playtimes: this.top_5_playtimes,
      favorite_scale: this.favorite_scale,
      scale_distribution: this.scale_distribution,
      favorite_genre_by_time: this.favorite_genre_by_time,
      favorite_genre_by_count: this.favorite_genre_by_count,
      genre_shannon_index: this.genre_shannon_index,
      genre_distribution: this.genre_distribution,
      favorite_tags: this.favorite_tags,
      tag_weights: this.tag_weights,
    };
  }
}