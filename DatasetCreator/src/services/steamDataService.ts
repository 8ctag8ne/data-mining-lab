import axios, { AxiosInstance } from 'axios';
import { SteamGame, SteamGameDetails, SteamOwnedGamesResponse, SteamPlayerSummariesResponse } from '../models/steamModels'; // adjust path as needed

export class SteamApiService {
  private axiosInstance: AxiosInstance;
  private apiKey: string;

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
    const response = await this.axiosInstance.get<SteamGameDetails>(
        `https://steamspy.com/api.php`,
        {
            params: {
                request: 'appdetails',
                appid: appId
            },
        }
    );

    return response.data;

  }
}