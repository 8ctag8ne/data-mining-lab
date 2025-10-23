// Basic player model (from GetPlayerSummaries API)
export class SteamUser {
  constructor(
    public steamid: string,
    public personaname: string,
    public avatar?: string,
    public avatarmedium?: string,
    public avatarfull?: string,
    public avatarhash?: string,
    public profileurl?: string,
    public realname?: string,
    public loccountrycode?: string,
    public locstatecode?: string,
    public loccityid?: number,
    public communityvisibilitystate?: number,
    public profilestate?: number,
    public personastate?: number,
    public primaryclanid?: string,
    public timecreated?: number,
    public personastateflags?: number,
    // Additional fields
    public totalPlaytimeHours?: number,
    public totalGames?: number,
    public ownedGames?: SteamGame[],
  ) {
    this.profilestate = profilestate ?? 0;
  }
}

// basic game model (from GetOwnedGames API)
export class SteamGame {
  constructor(
    public appid: number,
    public name?: string,
    public playtime_forever?: number,
    public playtime_windows_forever?: number,
    public playtime_mac_forever?: number,
    public playtime_linux_forever?: number,
    public playtime_deck_forever?: number,
    public rtime_last_played?: number,
    public playtime_disconnected?: number,
    public img_icon_url?: string,
    public has_community_visible_stats?: boolean,
    public content_descriptorids?: number[],
    public owners?: string, //additional field from SteamSpy
    // Additional parsed fields
    public genres?: string[], // parsed from genre field
    public releaseYear?: number,
    public topTags?: string[] // top tags extracted from tags object
  ) {}
}

// Full information about the game (from SteamSpy API)
export class SteamGameDetails {
  constructor(
    public appid: number,
    public name?: string,
    public developer?: string,
    public publisher?: string,
    public score_rank?: string,
    public positive?: number,
    public negative?: number,
    public userscore?: number,
    public owners?: string,
    public average_forever?: number,
    public average_2weeks?: number,
    public median_forever?: number,
    public median_2weeks?: number,
    public price?: string,
    public initialprice?: string,
    public discount?: string,
    public ccu?: number,
    public languages?: string,
    public genre?: string,
    public tags?: Record<string, number>,
  ) {}
}

// Additional models for responses from Steam API GetPlayerSummaries
export interface SteamPlayerSummariesResponse {
  response: {
    players: SteamUser[];
  };
}

// Additional models for responses from Steam API GetOwnedGames
export interface SteamOwnedGamesResponse {
  response: {
    game_count?: number;
    games?: SteamGame[];
  };
}