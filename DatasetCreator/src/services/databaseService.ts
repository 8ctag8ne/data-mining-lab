import { MongoClient, Db, Collection, Filter } from 'mongodb';
import { SteamUser, SteamGameDetails } from '../models/steamModels';

export class MongoDbService {
  private readonly client: MongoClient;
  private db: Db | null = null;
  private readonly usersCollectionName = 'steam_users';
  private readonly gamesCollectionName = 'steam_games';

  constructor(connectionString: string, dbName: string) {
    this.client = new MongoClient(connectionString);
  }

  async connect(): Promise<void> {
    await this.client.connect();
    this.db = this.client.db();
    await this.initializeCollections();
  }

  private async initializeCollections(): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    const collections = await this.db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    // Створюємо колекцію користувачів якщо не існує
    if (!collectionNames.includes(this.usersCollectionName)) {
      await this.db.createCollection(this.usersCollectionName);
    }

    // Створюємо колекцію ігор якщо не існує
    if (!collectionNames.includes(this.gamesCollectionName)) {
      await this.db.createCollection(this.gamesCollectionName);
    }

    // Створюємо індекси
    const usersCollection = this.getUsersCollection();
    await usersCollection.createIndex({ steamid: 1 }, { unique: true });

    const gamesCollection = this.getGamesCollection();
    await gamesCollection.createIndex({ appid: 1 }, { unique: true });
  }

  private getUsersCollection(): Collection<SteamUser> {
    if (!this.db) throw new Error('Database not connected');
    return this.db.collection<SteamUser>(this.usersCollectionName);
  }

  private getGamesCollection(): Collection<SteamGameDetails> {
    if (!this.db) throw new Error('Database not connected');
    return this.db.collection<SteamGameDetails>(this.gamesCollectionName);
  }

  // ========== USERS CRUD ==========

  async createUser(user: SteamUser): Promise<void> {
    const collection = this.getUsersCollection();
    await collection.insertOne(user as any);
  }

  async createUsers(users: SteamUser[]): Promise<void> {
    if (users.length === 0) return;
    const collection = this.getUsersCollection();
    await collection.insertMany(users as any[], { ordered: false });
  }

  async getUserBySteamId(steamId: string): Promise<SteamUser | null> {
    const collection = this.getUsersCollection();
    return await collection.findOne({ steamid: steamId } as any);
  }

  async findUsers(filter: Filter<SteamUser>): Promise<SteamUser[]> {
    const collection = this.getUsersCollection();
    return await collection.find(filter).toArray();
  }

  async getAllUsers(): Promise<SteamUser[]> {
    const collection = this.getUsersCollection();
    return await collection.find({}).toArray();
  }

  async updateUser(steamId: string, update: Partial<SteamUser>): Promise<void> {
    const collection = this.getUsersCollection();
    await collection.updateOne(
      { steamid: steamId } as any,
      { $set: update }
    );
  }

  async upsertUser(user: SteamUser): Promise<void> {
    const collection = this.getUsersCollection();
    await collection.updateOne(
      { steamid: user.steamid } as any,
      { $set: user },
      { upsert: true }
    );
  }

  async deleteUser(steamId: string): Promise<void> {
    const collection = this.getUsersCollection();
    await collection.deleteOne({ steamid: steamId } as any);
  }

  async deleteAllUsers(): Promise<void> {
    const collection = this.getUsersCollection();
    await collection.deleteMany({});
  }

  // ========== GAMES CRUD ==========

  async createGame(game: SteamGameDetails): Promise<void> {
    const collection = this.getGamesCollection();
    await collection.insertOne(game as any);
  }

  async createGames(games: SteamGameDetails[]): Promise<void> {
    if (games.length === 0) return;
    const collection = this.getGamesCollection();
    await collection.insertMany(games as any[], { ordered: false });
  }

  async getGameByAppId(appId: number): Promise<SteamGameDetails | null> {
    const collection = this.getGamesCollection();
    return await collection.findOne({ appid: appId } as any);
  }

  async findGames(filter: Filter<SteamGameDetails>): Promise<SteamGameDetails[]> {
    const collection = this.getGamesCollection();
    return await collection.find(filter).toArray();
  }

  async getAllGames(): Promise<SteamGameDetails[]> {
    const collection = this.getGamesCollection();
    return await collection.find({}).toArray();
  }

  async updateGame(appId: number, update: Partial<SteamGameDetails>): Promise<void> {
    const collection = this.getGamesCollection();
    await collection.updateOne(
      { appid: appId } as any,
      { $set: update }
    );
  }

  async upsertGame(game: SteamGameDetails): Promise<void> {
    const collection = this.getGamesCollection();
    await collection.updateOne(
      { appid: game.appid } as any,
      { $set: game },
      { upsert: true }
    );
  }

  async deleteGame(appId: number): Promise<void> {
    const collection = this.getGamesCollection();
    await collection.deleteOne({ appid: appId } as any);
  }

  async deleteAllGames(): Promise<void> {
    const collection = this.getGamesCollection();
    await collection.deleteMany({});
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}

// Приклад використання:
// const mongoService = new MongoDbService('mongodb://localhost:27017', 'steam_db');
// await mongoService.connect();
//
// // Робота з користувачами
// const user = new SteamUser('76561197960435530', 'TestUser');
// await mongoService.createUser(user);
// const foundUser = await mongoService.getUserBySteamId('76561197960435530');
// await mongoService.updateUser('76561197960435530', { totalGames: 50 });
// await mongoService.deleteUser('76561197960435530');
//
// // Робота з іграми
// const game = new SteamGameDetails(620, 'Portal 2');
// await mongoService.createGame(game);
// const foundGame = await mongoService.getGameByAppId(620);
// await mongoService.updateGame(620, { owners: '5,000,000 .. 10,000,000' });
// await mongoService.deleteGame(620);
//
// await mongoService.close();