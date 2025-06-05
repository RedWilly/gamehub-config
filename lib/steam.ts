/**
 * Steam API utility for fetching game information
 * Uses steamgrab library to fetch game details by Steam App ID
 */

import { Steam } from 'steamgrab';
import { prisma } from './prisma';

export interface SteamGameInfo {
  steamId: string;
  name: string;
  imageUrl?: string;
}

/**
 * Fetches game information from Steam API or database
 * First checks if game exists in database, if not fetches from Steam
 * 
 * @param steamId - The Steam App ID
 * @returns Game information or null if not found
 */
export async function getGameInfo(steamId: string): Promise<SteamGameInfo | null> {
  try {
    // Check if game exists in database first
    const existingGame = await prisma.game.findUnique({
      where: { steamId },
      select: { 
        steamId: true,
        name: true,
        imageUrl: true
      }
    });

    // If game exists in database, return it
    if (existingGame) {
      return {
        steamId: existingGame.steamId,
        name: existingGame.name,
        imageUrl: existingGame.imageUrl
      };
    }

    // If not in database, fetch from Steam API
    const game = await Steam.getGameInfoById(Number(steamId));
    
    if (!game) {
      console.error(`No game found with Steam App ID: ${steamId}`);
      return null;
    }

    // Return the game information
    return {
      steamId,
      name: game.title,
      imageUrl: game.image
    };
  } catch (error) {
    if (error instanceof Steam.SteamScraperError) {
      console.error('Steam API error:', error.message);
    } else {
      console.error('Error fetching game info:', error);
    }
    return null;
  }
}
