import { Page } from '@playwright/test';
import { parseStringPromise } from 'xml2js';

export class SteamXmlProfilePage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async openXmlProfile(link: string): Promise<void> {
    const url = link.endsWith('/?xml=1') ? link : `${link}/?xml=1`;

    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  isSteamId64(value: string): boolean {
    return /^\d{17}$/.test(value);
  }

  async getSteamId64(): Promise<string | null> {
    const xmlContent = await this.page.content();
    try {
      const parsed = await parseStringPromise(xmlContent);
      return parsed?.profile?.steamID64?.[0] || null;
    } catch (error) {
      console.error('Failed to parse XML:', error);
      return null;
    }
  }

  async getProfileData(): Promise<Record<string, string | null>> {
    const xmlContent = await this.page.content();
    try {
      const parsed = await parseStringPromise(xmlContent);
      return {
        steamID64: parsed?.profile?.steamID64?.[0] || null,
        nickname: parsed?.profile?.steamID?.[0] || null,
        location: parsed?.profile?.location?.[0] || null,
        memberSince: parsed?.profile?.memberSince?.[0] || null,
        privacy: parsed?.profile?.privacyState?.[0] || null,
      };
    } catch {
      return {};
    }
  }
}
