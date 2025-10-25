import axios, { AxiosInstance } from 'axios';
import { SteamGameDetails, SteamOwnedGamesResponse, SteamPlayerSummariesResponse } from '../models/steamModels'; // adjust path as needed

export class SteamApiService {
  private readonly axiosInstance: AxiosInstance;
  private readonly apiKey: string;
  private steamSpyLastCallTimestamp: number = 0;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.axiosInstance = axios.create({
      baseURL: 'https://api.steampowered.com',
      timeout: 10000,
    });
  }

  async getOwnedGames(steamId: string): Promise<SteamOwnedGamesResponse> {
    const response = await this.axiosInstance.get<SteamOwnedGamesResponse>(
      '/IPlayerService/GetOwnedGames/v0001/',
      {
        params: {
          key: this.apiKey,
          steamid: steamId,
          include_appinfo: 1,
          format: 'json',
        },
      }
    );

    return response.data;
  }

  async getPlayersSummaries(steamIds: string[]): Promise<SteamPlayerSummariesResponse> {
    const response = await this.axiosInstance.get<SteamPlayerSummariesResponse>(
      '/ISteamUser/GetPlayerSummaries/v0002/',
      {
        params: {
          key: this.apiKey,
          steamids: steamIds.join(','),
          format: 'json',
        },
      }
    );

    return response.data;
  }
  async getGameDetails(appId: number): Promise<SteamGameDetails>{
    // if(Date.now() - this.steamSpyLastCallTimestamp < 1000)
    // {
    //   await delay(1000 - (Date.now() - this.steamSpyLastCallTimestamp));
    // }

    const response = await this.axiosInstance.get<SteamGameDetails>(
      `https://steamspy.com/api.php`,
      {
        params: {
          request: 'appdetails',
          appid: appId
        },
      }
    );
    this.steamSpyLastCallTimestamp = Date.now();

    return response.data;
  }
}

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}