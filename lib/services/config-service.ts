/**
 * Config Service
 * Handles database operations for game configurations
 */

import { prisma } from '../prisma';
import { DirectXHubType, AudioDriverType, Prisma } from '@prisma/client';
import { slugify } from '../utils';
import { type CreateConfigInput } from '@/lib/validations/config';

/**
 * Creates a new game configuration
 * 
 * @param data - Configuration data
 * @returns The created config or null if creation failed
 */
export async function createConfig(data: CreateConfigInput & { userId: string }) {
  try {
    // Get game and user for slug generation
    const [game, user] = await Promise.all([
      prisma.game.findUnique({ where: { id: data.gameId } }),
      prisma.user.findUnique({ where: { id: data.userId } })
    ]);

    if (!game || !user) {
      throw new Error('Game or user not found');
    }

    // Generate slug: game-name-by-username
    const slug = slugify(`${game.name}-by-${user.username}`);

    // Check if a config already exists for this game and user
    const existingConfig = await prisma.config.findUnique({
      where: {
        gameId_userId: {
          gameId: data.gameId,
          userId: data.userId
        }
      }
    });

    if (existingConfig) {
      throw new Error('You already have a config for this game');
    }

    // Create config and details in a transaction
    const config = await prisma.$transaction(async (tx) => {
      // Create the config
      const newConfig = await tx.config.create({
        data: {
          gameId: data.gameId,
          userId: data.userId,
          gamehubVersion: data.gamehubVersion,
          videoUrl: data.videoUrl,
          tags: data.tags,
          slug
        },
        include: {
          game: true,
          createdBy: true
        }
      });

      // Create config details
      await tx.configDetails.create({
        data: {
          configId: newConfig.id,
          language: data.details.language,
          gameResolution: data.details.gameResolution,
          directxHub: data.details.directxHub,
          envVars: data.details.envVars,
          commandLine: data.details.commandLine,
          compatLayer: data.details.compatLayer,
          gpuDriver: data.details.gpuDriver,
          audioDriver: data.details.audioDriver,
          dxvkVersion: data.details.dxvkVersion,
          vkd3dVersion: data.details.vkd3dVersion,
          cpuTranslator: data.details.cpuTranslator,
          cpuCoreLimit: data.details.cpuCoreLimit,
          vramLimit: data.details.vramLimit,
          components: data.details.components
        }
      });

      // Create initial version (v1)
      await tx.configVersion.create({
        data: {
          configId: newConfig.id,
          userId: data.userId,
          versionNumber: 1,
          configSnapshot: data.details as Prisma.JsonObject,
          changeSummary: 'Initial configuration'
        }
      });

      return newConfig;
    });

    return config;
  } catch (error) {
    console.error('Error creating config:', error);
    throw error;
  }
}

/**
 * Gets a configuration by its ID or slug
 * 
 * @param idOrSlug - Config ID or slug
 * @returns The config with details or null if not found
 */
export async function getConfig(idOrSlug: string) {
  try {
    // Check if it's a UUID (standard format with hyphens) or CUID format
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(idOrSlug);
    const isCuid = /^c[a-z0-9]{24}$/.test(idOrSlug);
    
    // Use ID directly without fallback to slug
    const config = await prisma.config.findUnique({
      where: { id: idOrSlug },
      include: {
        game: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            image: true
          }
        },
        details: true,
        versions: {
          orderBy: {
            versionNumber: 'desc'
          },
          include: {
            updatedBy: {
              select: {
                username: true
              }
            }
          }
        }
      }
    });

    return config;
  } catch (error) {
    console.error('Error fetching config:', error);
    return null;
  }
}

/**
 * Gets all configurations for a specific game
 * 
 * @param gameId - Game ID
 * @param page - Page number (default: 1)
 * @param limit - Number of configs per page (default: 20)
 * @returns Paginated list of configs
 */
export async function getConfigsByGame(gameId: string, page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit;
    
    const [configs, total] = await Promise.all([
      prisma.config.findMany({
        where: { 
          gameId,
          isHidden: false
        },
        skip,
        take: limit,
        orderBy: [
          { upvotes: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          createdBy: {
            select: {
              username: true,
              image: true
            }
          }
        }
      }),
      prisma.config.count({
        where: { 
          gameId,
          isHidden: false
        }
      })
    ]);
    
    return {
      configs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching configs by game:', error);
    throw error;
  }
}

/**
 * Gets all configurations created by a specific user
 * 
 * @param userId - User ID
 * @param page - Page number (default: 1)
 * @param limit - Number of configs per page (default: 20)
 * @returns Paginated list of configs
 */
export async function getConfigsByUser(userId: string, page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit;
    
    const [configs, total] = await Promise.all([
      prisma.config.findMany({
        where: { 
          userId,
          isHidden: false
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          game: true
        }
      }),
      prisma.config.count({
        where: { 
          userId,
          isHidden: false
        }
      })
    ]);
    
    return {
      configs,
      total
    };
  } catch (error) {
    console.error('Error fetching configs by user:', error);
    throw error;
  }
}

/**
 * Gets all configurations with optional sorting and filtering.
 * 
 * @param page - Page number for pagination.
 * @param limit - Number of items per page.
 * @param sort - The sorting order ('newest', 'oldest', 'popular', 'updated').
 * @param tags - An array of tags to filter by.
 * @param query - A search query to filter by game name.
 * @returns A paginated list of configurations.
 */
export async function getConfigs(page = 1, limit = 20, sort = 'popular', tags: string[] = [], query?: string) {
  try {
    const skip = (page - 1) * limit;

    let where: Prisma.ConfigWhereInput = {};

    if (query) {
      where.game = {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      };
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    let orderBy: Prisma.ConfigOrderByWithRelationInput = {};

    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'updated':
        orderBy = { updatedAt: 'desc' };
        break;
      case 'popular':
      default:
        orderBy = { upvotes: 'desc' };
        break;
    }

    const [configs, total] = await Promise.all([
      prisma.config.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          game: true,
          createdBy: {
            select: {
              username: true,
              image: true,
            },
          },
        },
      }),
      prisma.config.count({ where }),
    ]);

    return { configs, total };
  } catch (error) {
    console.error('Error fetching configs:', error);
    throw new Error('Failed to fetch configurations.');
  }
}

/**
 * Updates an existing configuration
 * 
 * @param configId - Config ID
 * @param userId - User ID making the update
 * @param data - Updated config data
 * @param changeSummary - Summary of changes made
 * @returns The updated config or null if update failed
 */
export async function updateConfig(
  configId: string, 
  userId: string, 
  data: {
    gamehubVersion?: string;
    videoUrl?: string | null;
    tags?: string[];
    details?: {
      language?: string | null;
      gameResolution?: string;
      directxHub?: DirectXHubType;
      envVars?: string | null;
      commandLine?: string | null;
      compatLayer?: string;
      gpuDriver?: string;
      audioDriver?: AudioDriverType;
      dxvkVersion?: string;
      vkd3dVersion?: string;
      cpuTranslator?: string;
      cpuCoreLimit?: string;
      vramLimit?: string;
      components?: string[];
    };
  }, 
  changeSummary: string
) {
  try {
    // Get current config to check permissions
    const config = await prisma.config.findUnique({
      where: { id: configId },
      include: { details: true }
    });

    if (!config) {
      throw new Error('Config not found');
    }

    // Update the config in a transaction
    const updatedConfig = await prisma.$transaction(async (tx) => {
      // Update basic config fields if provided
      if (data.gamehubVersion || data.videoUrl !== undefined || data.tags) {
        await tx.config.update({
          where: { id: configId },
          data: {
            gamehubVersion: data.gamehubVersion || config.gamehubVersion,
            videoUrl: data.videoUrl !== undefined ? data.videoUrl : config.videoUrl,
            tags: data.tags || config.tags
          }
        });
      }

      // Update config details if provided
      if (data.details) {
        await tx.configDetails.update({
          where: { configId },
          data: {
            language: data.details.language !== undefined ? data.details.language : config.details?.language,
            gameResolution: data.details.gameResolution !== undefined ? data.details.gameResolution : config.details?.gameResolution || '',
            directxHub: data.details.directxHub !== undefined ? data.details.directxHub : config.details?.directxHub || 'DISABLE',
            envVars: data.details.envVars !== undefined ? data.details.envVars : config.details?.envVars,
            commandLine: data.details.commandLine !== undefined ? data.details.commandLine : config.details?.commandLine,
            compatLayer: data.details.compatLayer !== undefined ? data.details.compatLayer : config.details?.compatLayer || '',
            gpuDriver: data.details.gpuDriver !== undefined ? data.details.gpuDriver : config.details?.gpuDriver || '',
            audioDriver: data.details.audioDriver !== undefined ? data.details.audioDriver : config.details?.audioDriver || 'ALSA',
            dxvkVersion: data.details.dxvkVersion !== undefined ? data.details.dxvkVersion : config.details?.dxvkVersion || '',
            vkd3dVersion: data.details.vkd3dVersion !== undefined ? data.details.vkd3dVersion : config.details?.vkd3dVersion || '',
            cpuTranslator: data.details.cpuTranslator !== undefined ? data.details.cpuTranslator : config.details?.cpuTranslator || '',
            cpuCoreLimit: data.details.cpuCoreLimit !== undefined ? data.details.cpuCoreLimit : config.details?.cpuCoreLimit || '',
            vramLimit: data.details.vramLimit !== undefined ? data.details.vramLimit : config.details?.vramLimit || '',
            components: data.details.components !== undefined ? data.details.components : config.details?.components || []
          }
        });
      }

      // Get the latest version number
      const latestVersion = await tx.configVersion.findFirst({
        where: { configId },
        orderBy: { versionNumber: 'desc' }
      });

      const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

      // Create a new version
      await tx.configVersion.create({
        data: {
          configId,
          userId,
          versionNumber: newVersionNumber,
          configSnapshot: {
            ...config.details,
            ...(data.details || {})
          } as Prisma.JsonObject,
          changeSummary
        }
      });

      // Return the updated config
      return tx.config.findUnique({
        where: { id: configId },
        include: {
          details: true,
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1
          }
        }
      });
    });

    return updatedConfig;
  } catch (error) {
    console.error('Error updating config:', error);
    throw error;
  }
}

/**
 * Reverts a configuration to a previous version
 * 
 * @param configId - ID of the configuration to revert
 * @param versionId - ID of the version to revert to
 * @param userId - ID of the user performing the revert
 * @returns The reverted configuration or null if revert failed
 */
export async function revertConfigToVersion(
  configId: string,
  versionId: string,
  userId: string
) {
  try {
    // Get the version to revert to
    const versionToRevert = await prisma.configVersion.findUnique({
      where: { id: versionId },
      include: {
        config: {
          include: { details: true }
        }
      }
    });

    if (!versionToRevert) {
      throw new Error('Version not found');
    }

    // Extract the configuration snapshot from the version
    const configSnapshot = versionToRevert.configSnapshot as any;
    
    if (!configSnapshot) {
      throw new Error('Version snapshot is missing');
    }

    // Update the config with the snapshot data in a transaction
    const revertedConfig = await prisma.$transaction(async (tx) => {
      // Update config details with snapshot data
      await tx.configDetails.update({
        where: { configId },
        data: {
          language: configSnapshot.language,
          gameResolution: configSnapshot.gameResolution || '',
          directxHub: configSnapshot.directxHub || 'DISABLE',
          envVars: configSnapshot.envVars,
          commandLine: configSnapshot.commandLine,
          compatLayer: configSnapshot.compatLayer || '',
          gpuDriver: configSnapshot.gpuDriver || '',
          audioDriver: configSnapshot.audioDriver || 'ALSA',
          dxvkVersion: configSnapshot.dxvkVersion || '',
          vkd3dVersion: configSnapshot.vkd3dVersion || '',
          cpuTranslator: configSnapshot.cpuTranslator || '',
          cpuCoreLimit: configSnapshot.cpuCoreLimit || '',
          vramLimit: configSnapshot.vramLimit || '',
          components: configSnapshot.components || []
        }
      });

      // Get the latest version number
      const latestVersion = await tx.configVersion.findFirst({
        where: { configId },
        orderBy: { versionNumber: 'desc' }
      });

      const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

      // Create a new version to record this revert action
      await tx.configVersion.create({
        data: {
          configId,
          userId,
          versionNumber: newVersionNumber,
          configSnapshot: configSnapshot as Prisma.JsonObject,
          changeSummary: `Reverted to version ${versionToRevert.versionNumber}`
        }
      });

      // Return the updated config
      return tx.config.findUnique({
        where: { id: configId },
        include: {
          details: true,
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1,
            include: {
              updatedBy: {
                select: {
                  username: true
                }
              }
            }
          }
        }
      });
    });

    return revertedConfig;
  } catch (error) {
    console.error('Error reverting config version:', error);
    return null;
  }
}
