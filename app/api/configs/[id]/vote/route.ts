/**
 * API Route for voting on a configuration
 * POST /api/configs/[id]/vote
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { voteSchema } from "@/lib/validations/config";

/**
 * POST handler to cast or update a vote on a configuration
 * 
 * @param request - The incoming request with vote value
 * @param params - Route parameters containing config ID
 * @returns API response with updated vote counts
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required to vote" },
        { status: 401 }
      );
    }

    // Get the config ID from params
    const { id: configId } = params;

    // Parse and validate the request body
    const body = await request.json();
    const validationResult = voteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid vote value. Must be -1, 0, or 1" },
        { status: 400 }
      );
    }

    const { value } = validationResult.data;
    const userId = session.user.id;

    // Check if the config exists
    const config = await prisma.config.findUnique({
      where: { id: configId },
    });

    if (!config) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    // Check if the user is trying to vote on their own config
    if (config.userId === userId) {
      return NextResponse.json(
        { error: "You cannot vote on your own configuration" },
        { status: 403 }
      );
    }

    // Check if user has already voted on this config
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_configId: {
          userId,
          configId,
        },
      },
    });

    // Process the vote in a transaction to ensure consistency
    const transactionResult = await prisma.$transaction(async (tx) => {
      let updatedConfig;

      if (existingVote) {
        // If vote value is 0, remove the vote
        if (value === 0) {
          // Remove the previous vote from the counts
          const updateData: { upvotes?: { decrement: number }; downvotes?: { decrement: number } } = {};
          
          if (existingVote.value === 1) {
            updateData.upvotes = { decrement: 1 };
          } else if (existingVote.value === -1) {
            updateData.downvotes = { decrement: 1 };
          }
          
          // Delete the vote
          await tx.vote.delete({
            where: {
              userId_configId: {
                userId,
                configId,
              },
            },
          });
          
          // Update the config vote counts
          updatedConfig = await tx.config.update({
            where: { id: configId },
            data: updateData,
            select: {
              id: true,
              upvotes: true,
              downvotes: true,
            },
          });
        } else if (existingVote.value !== value) {
          // Update the existing vote if the value has changed
          const updateData: { 
            upvotes?: { increment: number } | { decrement: number }; 
            downvotes?: { increment: number } | { decrement: number } 
          } = {};
          
          // Handle the case where a user changes from upvote to downvote or vice versa
          if (existingVote.value === 1 && value === -1) {
            updateData.upvotes = { decrement: 1 };
            updateData.downvotes = { increment: 1 };
          } else if (existingVote.value === -1 && value === 1) {
            updateData.upvotes = { increment: 1 };
            updateData.downvotes = { decrement: 1 };
          }
          
          // Update the vote
          await tx.vote.update({
            where: {
              userId_configId: {
                userId,
                configId,
              },
            },
            data: { value },
          });
          
          // Update the config vote counts
          updatedConfig = await tx.config.update({
            where: { id: configId },
            data: updateData,
            select: {
              id: true,
              upvotes: true,
              downvotes: true,
            },
          });
        } else {
          // Vote hasn't changed, return current counts
          updatedConfig = {
            id: configId,
            upvotes: config.upvotes,
            downvotes: config.downvotes,
          };
        }
      } else if (value !== 0) {
        // Create a new vote
        const updateData: { 
          upvotes?: { increment: number }; 
          downvotes?: { increment: number } 
        } = {};
        
        if (value === 1) {
          updateData.upvotes = { increment: 1 };
        } else if (value === -1) {
          updateData.downvotes = { increment: 1 };
        }
        
        // Create the vote
        await tx.vote.create({
          data: {
            userId,
            configId,
            value,
          },
        });
        
        // Update the config vote counts
        updatedConfig = await tx.config.update({
          where: { id: configId },
          data: updateData,
          select: {
            id: true,
            upvotes: true,
            downvotes: true,
          },
        });
      } else {
        // No existing vote and value is 0, do nothing
        updatedConfig = {
          id: configId,
          upvotes: config.upvotes,
          downvotes: config.downvotes,
        };
      }

      return updatedConfig;
    });

    return NextResponse.json({
      message: "Vote processed successfully",
      config: transactionResult,
    });
  } catch (error) {
    console.error("Error processing vote:", error);
    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500 }
    );
  }
}
