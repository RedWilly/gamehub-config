/**
 * API endpoint for uploading user profile images
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadProfileImageToGitHub } from "@/lib/profile-upload";

/**
 * POST handler for uploading a profile image
 * 
 * @param req - The incoming request object
 * @returns NextResponse with the upload result
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
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
    
    // Parse the request body
    const body = await req.json();
    const { imageData, fileExtension } = body;
    
    // Validate the request data
    if (!imageData) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }
    
    if (!fileExtension || !['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension.toLowerCase())) {
      return NextResponse.json(
        { error: "Valid file extension is required (png, jpg, jpeg, gif, webp)" },
        { status: 400 }
      );
    }
    
    // Upload the image to GitHub
    const imageUrl = await uploadProfileImageToGitHub({
      imageData,
      userId: session.user.id,
      fileExtension,
    });
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }
    
    // Return the image URL
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
