import { test, expect, Page } from '@playwright/test';
import { GroupPage } from './groupPage';
import { writeCsvRow } from '../utils/csvWriter';
import { appendToFile } from '../utils/fileWriter';
import { SteamXmlProfilePage } from './SteamXmlProfilePage';

const GROUP_URL = 'https://steamcommunity.com/groups/ukraine';
const START_PAGE = 1;
const END_PAGE = 1;

// Check if the URL already contains a numeric steamID64
function extractSteamIdFromHref(href: string): string | null {
    if (href.includes('profiles')) {
        const match = new RegExp(/profiles\/(\d+)/).exec(href);
        return match ? match[1] : null;
    }
    return null;
}

// Process one user: detect or fetch steamID64 and write to files
async function processUser(page : Page, href: string) {
    const steamIdFromUrl = extractSteamIdFromHref(href);
    let steamId: string | null = steamIdFromUrl;
    let steamXmlProfilePage = new SteamXmlProfilePage(page);

    if (!steamIdFromUrl) {
        await steamXmlProfilePage.openXmlProfile(href);
        steamId = await steamXmlProfilePage.getSteamId64();
    }

    if (steamId) {
        console.log(`Found steamID64: ${steamId} for profile ${href}`);
        await writeCsvRow('steam_ids.csv', [steamId]);
    } else {
        console.log(`steamID64 not found for profile ${href}, logging to failsafe.txt`);
        await appendToFile('failsafe.txt', href);
    }
}

// Main test
test('Steam group scraper', async ({ page }) => {
    test.setTimeout(0); // Disable timeout for long scraping
    const groupPage = new GroupPage(page);

    console.log(`Starting scraping from ${GROUP_URL}`);

    for (let i = START_PAGE; i <= END_PAGE; i++) {
        await groupPage.goToMembersPage(GROUP_URL, i);

        const hrefs = await groupPage.getMemberLinks();
        console.log(`Found ${hrefs.length} profile links on page ${i}`);

        for (let j = 0; j < hrefs.length; j++) {
            const href = hrefs[j];
            console.log(`Processing user ${j + 1}/${hrefs.length} on page ${i}: ${href}`);
            await processUser(page, href);
        }

        await groupPage.waitBetweenPages();
    }

    console.log('Scraping completed.');
});