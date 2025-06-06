/**
 * Game Service
 * Handles database operations for games including fetching from Steam and uploading images to GitHub
 */

import { prisma } from '../prisma';
import { getGameInfo } from '../steam';
import { uploadImageToGitHub } from '../github-upload';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/**
 * Fetches or creates a game by Steam App ID
 * Uses a race-condition safe approach with proper error handling
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

    // Prepare image URL - default to Steam image or placeholder
    let finalImageUrl = gameInfo.imageUrl || `https://via.placeholder.com/460x215?text=${encodeURIComponent(gameInfo.name)}`;

    // Try to upload image to GitHub if available
    if (gameInfo.imageUrl) {
      try {
        const fileName = `${steamId}.jpg`;
        const githubImageUrl = await uploadImageToGitHub({
          imageUrl: gameInfo.imageUrl,
          fileName,
        });
        
        // Only update URL if upload was successful
        if (githubImageUrl) {
          finalImageUrl = githubImageUrl;
        }
      } catch (uploadError) {
        // Log error but continue with original image URL
        console.error('Error uploading image to GitHub:', uploadError);
        // We'll fall back to the Steam image URL
      }
    }

    try {
      // Try to create the game record
      const newGame = await prisma.game.create({
        data: {
          steamId: gameInfo.steamId,
          name: gameInfo.name,
          imageUrl: finalImageUrl,
        },
      });
      
      return newGame;
    } catch (createError) {
      // If error is a unique constraint violation, another process likely created the game
      if (createError instanceof PrismaClientKnownRequestError && createError.code === 'P2002') {
        // Try to fetch the game that was just created by another process
        const justCreatedGame = await prisma.game.findUnique({
          where: { steamId },
        });
        
        if (justCreatedGame) {
          return justCreatedGame;
        }
      }
      
      // Re-throw other errors
      throw createError;
    }
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
