/**
 * Type definitions for game configurations
 */

import { DirectXHubType, AudioDriverType } from "@prisma/client";

/**
 * Interface for config creation data
 */
export interface CreateConfigData {
  gameId: string;
  userId: string;
  gamehubVersion: string;
  videoUrl?: string | null;
  tags: string[];
  details: ConfigDetailsData;
}

/**
 * Interface for config details data
 */
export interface ConfigDetailsData {
  language?: string | null;
  gameResolution: string;
  directxHub: DirectXHubType;
  envVars?: string | null;
  commandLine?: string | null;
  compatLayer: string;
  gpuDriver: string;
  audioDriver: AudioDriverType;
  dxvkVersion: string;
  vkd3dVersion: string;
  cpuTranslator: string;
  cpuCoreLimit: string;
  vramLimit: string;
  components: string[];
}

/**
 * Interface for config update data
 */
export interface UpdateConfigData {
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
  changeSummary: string;
}

/**
 * Interface for config response with all related data
 */
export interface ConfigWithDetails {
  id: string;
  gameId: string;
  userId: string;
  gamehubVersion: string;
  videoUrl: string | null;
  isLegacy: boolean;
  isHidden: boolean;
  upvotes: number;
  downvotes: number;
  slug: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  game: {
    id: string;
    steamId: string;
    name: string;
    imageUrl: string;
  };
  createdBy: {
    id: string;
    username: string;
    image: string | null;
  };
  details: ConfigDetailsData;
  versions: ConfigVersion[];
}

/**
 * Interface for config version data
 */
export interface ConfigVersion {
  id: string;
  configId: string;
  userId: string;
  versionNumber: number;
  configSnapshot: ConfigDetailsData;
  changeSummary: string;
  createdAt: Date;
  updatedBy: {
    username: string;
  };
}

/**
 * Interface for paginated config results
 */
export interface PaginatedConfigs<T> {
  configs: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
