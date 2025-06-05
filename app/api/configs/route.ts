/**
 * API route for config management
 * Handles GET and POST requests for game configurations
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createConfig, getConfigsByGame, getConfigsByUser } from "@/lib/services/config-service";
import { z } from "zod";
import { DirectXHubType, AudioDriverType } from "@prisma/client";

// Schema for config creation validation
const configSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  gamehubVersion: z.string().min(1, "GameHub version is required"),
  videoUrl: z.string().url().optional().nullable(),
  tags: z.array(z.string()).default([]),
  details: z.object({
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
    components: z.array(z.string()).default([])
  })
});

/**
 * GET /api/configs
 * Get configurations with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const gameId = searchParams.get("gameId");
    const userId = searchParams.get("userId");
    
    // Validate authentication for user-specific queries
    if (userId) {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      
      // Only allow users to see their own configs or admins/mods to see any user's configs
      if (!session || (session.user.id !== userId && session.user.role === "USER")) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
      
      const result = await getConfigsByUser(userId, page, limit);
      return NextResponse.json(result);
    }
    
    // If gameId is provided, get configs for that game
    if (gameId) {
      const result = await getConfigsByGame(gameId, page, limit);
      return NextResponse.json(result);
    }
    
    // If no filters provided, return error
    return NextResponse.json(
      { error: "Missing required query parameters: gameId or userId" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching configs:", error);
    return NextResponse.json(
      { error: "Failed to fetch configurations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/configs
 * Create a new game configuration
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check if user is suspended
    if (session.user.suspendedUntil && new Date(session.user.suspendedUntil) > new Date()) {
      return NextResponse.json(
        { error: "Your account is currently suspended" },
        { status: 403 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    
    const validationResult = configSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const configData = validationResult.data;
    
    // Create the config
    const config = await createConfig({
      ...configData,
      userId: session.user.id
    });
    
    return NextResponse.json(config, { status: 201 });
  } catch (error: any) {
    console.error("Error creating config:", error);
    
    // Handle specific errors
    if (error.message === "You already have a config for this game") {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    
    if (error.message === "Game or user not found") {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create configuration" },
      { status: 500 }
    );
  }
}
