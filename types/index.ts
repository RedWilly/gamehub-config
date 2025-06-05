// User Types
export type Role = 'admin' | 'moderator' | 'user';

export interface User {
  id: string;
  name?: string;
  username: string;
  displayUsername: string;
  email?: string;
  role: Role;
  suspendedUntil?: Date | null;
  createdAt: Date;
}

export interface SocialAccount {
  id: string;
  user_id: string;
  provider: 'github';
  provider_user_id: string;
}

// Config Types
export interface Config {
  id: string;
  game_steam_id: string;
  game_name: string;
  game_image_url: string;
  created_by: string;
  gamehub_version: string;
  is_legacy: boolean;
  is_hidden: boolean;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConfigDetails {
  config_id: string;
  language?: string;
  game_resolution: string;
  directx_hub: 'Disable' | 'Simple' | 'Complete';
  environment_variables?: string;
  command_line?: string;
  compatibility_layer: string;
  gpu_driver: string;
  audio_driver: 'Pulse' | 'Alsa';
  dxvk_version: string;
  vkd3d_version: string;
  cpu_translator: string;
  cpu_core_limit: string;
  vram_limit: string;
  components?: string[];
}

export interface ConfigVersionHistory {
  id: string;
  config_id: string;
  version_number: number;
  config_snapshot: ConfigDetails;
  updated_by: string;
  change_summary: string;
  createdAt: Date;
}

export interface ConfigVote {
  id: string;
  user_id: string;
  config_id: string;
  vote: -1 | 1;
  createdAt: Date;
}

// Comment Types
export interface Comment {
  id: string;
  config_id: string;
  user_id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentVote {
  id: string;
  user_id: string;
  comment_id: string;
  vote: -1 | 1;
  createdAt: Date;
}

// Report Types
export interface Report {
  id: string;
  reporter_id: string;
  reported_config_id?: string;
  reported_comment_id?: string;
  reason: string;
  status: 'open' | 'reviewed' | 'dismissed';
  createdAt: Date;
}

// Steam API Types
export interface SteamGameDetails {
  name: string;
  image_url: string;
  description: string;
}

// Form Types
export interface ConfigFormData {
  game_steam_id: string;
  language?: string;
  game_resolution: string;
  directx_hub: 'Disable' | 'Simple' | 'Complete';
  environment_variables?: string;
  command_line?: string;
  compatibility_layer: string;
  gpu_driver: string;
  audio_driver: 'Pulse' | 'Alsa';
  dxvk_version: string;
  vkd3d_version: string;
  cpu_translator: string;
  cpu_core_limit: string;
  vram_limit: string;
  components?: string[];
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Constants
export const CPU_CORE_LIMITS = ['No Limit', '1 Core', '2 Core', '3 Core', '4 Core', '5 Core', '6 Core', '7 Core'] as const;
export const VRAM_LIMITS = ['No Limit', '512MB', '1GB', '2GB', '3GB', '4GB'] as const;
export const COMPATIBILITY_LAYERS = ['Proton9.0-x64-2'] as const;
export const AUDIO_DRIVERS = ['Pulse', 'Alsa'] as const;
export const DIRECTX_HUB_OPTIONS = ['Disable', 'Simple', 'Complete'] as const;

export type CpuCoreLimit = typeof CPU_CORE_LIMITS[number];
export type VramLimit = typeof VRAM_LIMITS[number];
export type CompatibilityLayer = typeof COMPATIBILITY_LAYERS[number];
export type AudioDriver = typeof AUDIO_DRIVERS[number];
export type DirectXHubOption = typeof DIRECTX_HUB_OPTIONS[number];