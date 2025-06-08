/**
 * API route for individual config operations
 * Handles GET, PATCH, and DELETE requests for specific configurations
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getConfig, updateConfig } from "@/lib/services/config-service";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { DirectXHubType, AudioDriverType, Role } from "@prisma/client";
import { canEditContent, canDeleteContent, canReadConfig } from "@/lib/permissions";

// Schema for config update validation
const updateConfigSchema = z.object({
  gamehubVersion: z.string().min(1).optional(),
  videoUrl: z.string().url().nullable().optional(),
  tags: z.array(z.string()).optional(),
  details: z
    .object({
      language: z.string().nullable().optional(),
      gameResolution: z.string().min(1).optional(),
      directxHub: z.nativeEnum(DirectXHubType).optional(),
      envVars: z.string().nullable().optional(),
      commandLine: z.string().nullable().optional(),
      compatLayer: z.string().min(1).optional(),
      gpuDriver: z.string().min(1).optional(),
      audioDriver: z.nativeEnum(AudioDriverType).optional(),
      dxvkVersion: z.string().min(1).optional(),
      vkd3dVersion: z.string().min(1).optional(),
      cpuTranslator: z.string().min(1).optional(),
      cpuCoreLimit: z.string().min(1).optional(),
      vramLimit: z.string().min(1).optional(),
      components: z.array(z.string()).optional(),
    })
    .optional(),
  changeSummary: z.string().min(1, "Change summary is required"),
});

/**
 * GET /api/configs/[id]
 * Get a specific configuration by ID or slug
 * Public access allowed for non-hidden configs
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const config = await getConfig(params.id);

    if (!config) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    // Check if config is hidden
    if (config.isHidden) {
      // For hidden configs, check authentication and permissions
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      // Use the canReadConfig helper to determine access
      const userRole = session?.user?.role as Role | null;
      const userId = session?.user?.id;
      
      if (!canReadConfig(userRole, config.isHidden, config.userId, userId)) {
        return NextResponse.json(
          { error: "Configuration not found" },
          { status: 404 }
        );
      }
    }
    // Non-hidden configs can be viewed by anyone (including unauthenticated users)

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json(
      { error: "Failed to fetch configuration" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/configs/[id]
 * Update a specific configuration
 * Requires authentication and appropriate permissions
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is suspended
    if (
      session.user.suspendedUntil &&
      new Date(session.user.suspendedUntil) > new Date()
    ) {
      return NextResponse.json(
        { error: "Your account is currently suspended" },
        { status: 403 }
      );
    }

    // Get the config to check permissions
    const config = await prisma.config.findUnique({
      where: { id: params.id },
    });

    if (!config) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to edit this config
    if (!canEditContent(session.user.role as Role, config.userId, session.user.id)) {
      return NextResponse.json(
        { error: "You don't have permission to edit this configuration" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    const validationResult = updateConfigSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Update the config
    const updatedConfig = await updateConfig(
      params.id,
      session.user.id,
      updateData,
      updateData.changeSummary
    );

    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error("Error updating config:", error);
    return NextResponse.json(
      { error: "Failed to update configuration" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/configs/[id]
 * Delete a specific configuration
 * Requires authentication and appropriate permissions
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the config to check permissions
    const config = await prisma.config.findUnique({
      where: { id: params.id },
    });

    if (!config) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to delete this config
    if (!canDeleteContent(session.user.role as Role, config.userId, session.user.id)) {
      return NextResponse.json(
        { error: "You don't have permission to delete this configuration" },
        { status: 403 }
      );
    }

    // For admins: permanent delete
    if (session.user.role === Role.ADMIN) {
      await prisma.config.delete({
        where: { id: params.id },
      });
    } 
    // For config owners: hide the config (soft delete)
    else {
      await prisma.config.update({
        where: { id: params.id },
        data: { isHidden: true },
      });
    }

    return NextResponse.json(
      { message: "Configuration deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting config:", error);
    return NextResponse.json(
      { error: "Failed to delete configuration" },
      { status: 500 }
    );
  }
}
