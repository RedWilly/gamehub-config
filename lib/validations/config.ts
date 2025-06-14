/**
 * Config Validation Schemas
 * 
 * This file centralizes all validation schemas and types related to configs, comments, and votes.
 * It follows the DRY principle by providing a single source of truth for validation logic
 * that is used across multiple components and API routes.
 * 
 * Usage:
 * - Import the schemas directly for validation: `import { configSchema } from "@/lib/validations/config"`
 * - Import the TypeScript types for type safety: `import { type ConfigInput } from "@/lib/validations/config"`
 */

import { z } from "zod";
import { DirectXHubType, AudioDriverType } from "@prisma/client";

/**
 * Base schema for config details
 * Contains all the common fields for config details
 */
export const configDetailsSchema = z.object({
  language: z.string().optional().nullable(),
  gameResolution: z.string().min(1, "Game resolution is required"),
  directxHub: z.nativeEnum(DirectXHubType),
  envVars: z.string().optional().nullable(),
  commandLine: z.string().optional().nullable(),
  compatLayer: z.string().min(1, "Compatibility layer is required"),
  gpuDriver: z.string().min(1, "GPU driver is required"),
  audioDriver: z.nativeEnum(AudioDriverType),
  dxvkVersion: z.string().min(1, "DXVK version is required"),
  vkd3dVersion: z.string().min(1, "VKD3D version is required"),
  cpuTranslator: z.string().min(1, "CPU translator is required"),
  cpuCoreLimit: z.string().min(1, "CPU core limit is required"),
  vramLimit: z.string().min(1, "VRAM limit is required"),
  components: z.array(z.string()).default([]),
  notes: z.string().optional().nullable(),
});

/**
 * Schema for creating a new config
 */
export const createConfigSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  gamehubVersion: z.string().min(1, "GameHub version is required"),
  videoUrl: z.string().optional().nullable().refine(
    (val) => !val || val.trim() === "" || /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(val),
    "Must be a valid YouTube URL or empty"
  ),
  tags: z.array(z.string()).default([]),
  details: configDetailsSchema,
});

/**
 * Schema for form submission with optional change summary
 */
export const configFormSchema = createConfigSchema.extend({
  changeSummary: z.string().max(60, "Summary must be 60 characters or less").optional(),
});

/**
 * Schema for updating an existing config
 * Makes all fields optional except changeSummary
 */
export const updateConfigSchema = z.object({
  gamehubVersion: z.string().min(1).optional(),
  videoUrl: z.string().optional().nullable().refine(
    (val) => !val || val.trim() === "" || /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(val),
    "Must be a valid YouTube URL or empty"
  ),
  tags: z.array(z.string()).optional(),
  details: configDetailsSchema.partial().optional(),
  changeSummary: z.string().min(1, "Change summary is required"),
});

/**
 * Schema for voting on a config
 */
export const voteSchema = z.object({
  value: z.number().int().min(-1).max(1),
});

/**
 * Schema for commenting on a config
 */
export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment is too long"),
});

/**
 * Schema for voting on a comment
 */
export const commentVoteSchema = z.object({
  value: z.number().int().min(-1).max(1),
});

/**
 * Schema for game data in config responses
 */
export const gameSchema = z.object({
  id: z.string(),
  steamId: z.string(),
  name: z.string(),
  imageUrl: z.string(),
});

/**
 * Schema for user data in config responses
 */
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  image: z.string().nullable(),
});

/**
 * Schema for config version data
 */
export const configVersionSchema = z.object({
  id: z.string(),
  configId: z.string(),
  userId: z.string(),
  versionNumber: z.number(),
  configSnapshot: configDetailsSchema,
  changeSummary: z.string(),
  createdAt: z.date(),
  updatedBy: z.object({
    username: z.string(),
  }),
});

/**
 * Schema for complete config with details
 */
export const configWithDetailsSchema = z.object({
  id: z.string(),
  gameId: z.string(),
  userId: z.string(),
  gamehubVersion: z.string(),
  videoUrl: z.string().nullable(),
  isLegacy: z.boolean(),
  isHidden: z.boolean(),
  upvotes: z.number(),
  downvotes: z.number(),
  slug: z.string(),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
  game: gameSchema,
  createdBy: userSchema,
  details: configDetailsSchema,
  versions: z.array(configVersionSchema),
});

/**
 * Schema for pagination data
 */
export const paginationSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  pages: z.number(),
});

/**
 * Schema for paginated config results
 */
export const paginatedConfigsSchema = z.object({
  configs: z.array(configWithDetailsSchema),
  pagination: paginationSchema,
});

// TypeScript type exports
export type ConfigDetails = z.infer<typeof configDetailsSchema>;
export type CreateConfigInput = z.infer<typeof createConfigSchema>;
export type ConfigFormValues = z.infer<typeof configFormSchema>;
export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type CommentVoteInput = z.infer<typeof commentVoteSchema>;
export type GameData = z.infer<typeof gameSchema>;
export type UserData = z.infer<typeof userSchema>;
export type ConfigVersion = z.infer<typeof configVersionSchema>;
export type ConfigWithDetails = z.infer<typeof configWithDetailsSchema>;
export type PaginationData = z.infer<typeof paginationSchema>;

/**
 * Generic type for paginated results
 * Allows for different types of items in the configs array
 */
export type PaginatedConfigs<T = ConfigWithDetails> = {
  configs: T[];
  pagination: PaginationData;
};
