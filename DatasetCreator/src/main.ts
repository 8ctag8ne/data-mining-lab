import { all } from "axios";
import { SteamApiService } from "./services/steamApiService";
import { CsvReader } from "./utils/csvReader";

const steamService = new SteamApiService("8651E72B7AB56C749DCC374586F499C4");

const csvReader = new CsvReader();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
async function main() {
    let realUsersCount = 0, allUsersCount = 0;



    for await ( let steamId of csvReader.readSteamIds('../steam_ids_sample.csv')){
        const userInfo = (await steamService.getPlayersSummaries([steamId])).response.players[0];
        if(userInfo?.communityvisibilitystate != 3 || userInfo?.profilestate != 1){
            allUsersCount++;
            continue;
        }
        const ownedGames = await steamService.getOwnedGames(steamId);

        if(!ownedGames.response.game_count || ownedGames.response.game_count == 0){
            allUsersCount++;
            continue;
        }
        console.log(`User ${steamId} owns ${ownedGames.response.game_count} games.`);
        realUsersCount++;
        allUsersCount++;
    }

    console.log(`Real users: ${realUsersCount} out of ${allUsersCount}`);
}

main().catch(console.error);