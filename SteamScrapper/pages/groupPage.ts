import { Locator, Page } from '@playwright/test';
import { LOGGING } from '../constants';

export class GroupPage {
    readonly page: Page;
    readonly memberLinks: Locator;
    private pageCounter : number = 0;

    constructor(page: Page) {
        this.page = page;
        this.memberLinks = page.locator("//div[contains(@class, 'member_block_content ')]//a");
    }

    async getMemberLinks(): Promise<string[]> {
        const elements = await this.memberLinks.all();
        const hrefs: string[] = [];

        for (const el of elements) {
            const href = await el.getAttribute('href');
            if (href) hrefs.push(href);
        }

        return [...new Set(hrefs)];
    }

    async goToMembersPage(baseUrl: string, pageNumber: number): Promise<void> {
        const url = `${baseUrl}/members?p=${pageNumber}`;
        this.pageCounter = pageNumber;
        if(LOGGING){
            console.log(`Navigating to page ${pageNumber}: ${url}`);
        }

        await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    }

    async waitBetweenPages(): Promise<void> {
        if(LOGGING){
            console.log(`Waiting 2 seconds before next page...`);
        }
        await this.page.waitForTimeout(1000);
    }
}
