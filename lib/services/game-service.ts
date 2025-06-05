/**
 * Game Service
 * Handles database operations for games including fetching from Steam and uploading images to GitHub
 */

import { prisma } from '../prisma';
import { getGameInfo } from '../steam';
import { uploadImageToGitHub } from '../github-upload';

/**
 * Fetches or creates a game by Steam App ID
 * 
 * @param steamId - The Steam App ID
 * @returns The game object or null if not found/created
 */
export async function getOrCreateGame(steamId: string): Promise<{
  id: string;
  steamId: string;
  name: string;
  imageUrl: string;
} | null> {
  try {
    // Check if game exists in database
    const existingGame = await prisma.game.findUnique({
      where: { steamId },
    });

    // If game exists, return it
    if (existingGame) {
      return existingGame;
    }

    // If not in database, fetch from Steam API
    const gameInfo = await getGameInfo(steamId);
    if (!gameInfo) {
      return null;
    }

    // Upload image to GitHub if available
    let githubImageUrl: string | null = null;
    if (gameInfo.imageUrl) {
      const fileName = `${steamId}.jpg`;
      githubImageUrl = await uploadImageToGitHub({
        imageUrl: gameInfo.imageUrl,
        fileName,
      });
    }

    // If image upload failed or no image URL was provided, use original Steam image URL or a placeholder
    const finalImageUrl = githubImageUrl || gameInfo.imageUrl || `https://via.placeholder.com/460x215?text=${encodeURIComponent(gameInfo.name)}`;

    // Create new game in database
    const newGame = await prisma.game.create({
      data: {
        steamId: gameInfo.steamId,
        name: gameInfo.name,
        imageUrl: finalImageUrl,
      },
    });

    return newGame;
  } catch (error) {
    console.error('Error in getOrCreateGame:', error);
    return null;
  }
}

/**
 * Gets all games from database with pagination
 * 
 * @param page - Page number (default: 1)
 * @param limit - Number of games per page (default: 20)
 * @returns Paginated list of games
 */
export async function getAllGames(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  const [games, total] = await Promise.all([
    prisma.game.findMany({
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.game.count(),
  ]);
  
  return {
    games,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Searches games by name
 * 
 * @param query - Search query
 * @param page - Page number (default: 1)
 * @param limit - Number of games per page (default: 20)
 * @returns Paginated list of games matching search query
 */
export async function searchGames(query: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  const [games, total] = await Promise.all([
    prisma.game.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.game.count({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
    }),
  ]);
  
  return {
    games,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}
