/**
 * API Route for reverting a configuration to a previous version
 * POST /api/configs/[id]/versions/[versionId]/revert
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revertConfigToVersion } from "@/lib/services/config-service";

/**
 * POST handler to revert a configuration to a previous version
 * Only config authors, admins, and moderators can revert versions
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const { id, versionId } = params;

    // Get the current user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the configuration
    const config = await prisma.config.findUnique({
      where: { id },
      include: {
        versions: {
          where: { id: versionId },
          take: 1,
        },
      },
    });

    // Check if config exists
    if (!config) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    // Check if version exists
    if (!config.versions || config.versions.length === 0) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to revert
    const isAuthor = session.user.id === config.userId;
    const isAdminOrMod =
      session.user.role === Role.ADMIN || session.user.role === Role.MODERATOR;

    if (!isAuthor && !isAdminOrMod) {
      return NextResponse.json(
        { error: "You don't have permission to revert this configuration" },
        { status: 403 }
      );
    }

    // Revert the configuration to the specified version
    const revertedConfig = await revertConfigToVersion(id, versionId, session.user.id);

    if (!revertedConfig) {
      return NextResponse.json(
        { error: "Failed to revert configuration" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Configuration reverted successfully",
      config: revertedConfig,
    });
  } catch (error) {
    console.error("Error reverting configuration:", error);
    return NextResponse.json(
      { error: "Failed to revert configuration" },
      { status: 500 }
    );
  }
}
