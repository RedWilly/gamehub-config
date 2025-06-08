/**
 * Profile image upload utility
 * Uploads user profile images to GitHub repository and returns raw URL
 */

import { Octokit } from '@octokit/rest';
import { prisma } from './prisma';

// Parse GitHub repo information from environment variable
const GITHUB_REPO = process.env.GITHUB_REPO || '';
const repoUrl = new URL(GITHUB_REPO);
const [, owner, repo] = repoUrl.pathname.split('/');

// Initialize Octokit with GitHub token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

interface UploadProfileImageOptions {
  imageData: string; // Base64 encoded image data
  userId: string;
  fileExtension: string;
}

/**
 * Uploads a profile image to GitHub repository
 * 
 * @param options - Upload options containing image data, user ID, and file extension
 * @returns Raw URL of the uploaded image or null if upload fails
 */
export async function uploadProfileImageToGitHub(options: UploadProfileImageOptions): Promise<string | null> {
  try {
    const { imageData, userId, fileExtension } = options;
    const fileName = `${userId}-${Date.now()}.${fileExtension}`;
    const path = `profiles/${userId}/${fileName}`;
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
    
    // Remove the data URL prefix if present
    const base64Data = imageData.includes('base64,') 
      ? imageData.split('base64,')[1] 
      : imageData;
    
    try {
      // Upload file to GitHub repository
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: `Upload profile image for user ${userId}`,
        content: base64Data,
        // No SHA means create new file
      });
      
      // Update user's image URL in the database
      await prisma.user.update({
        where: { id: userId },
        data: { image: rawUrl }
      });
      
      return rawUrl;
    } catch (error: any) {
      // If error is 409 (conflict), try with a different filename
      if (error.status === 409) {
        console.log(`Conflict while uploading profile image for ${userId}, trying with a different filename`);
        return uploadProfileImageToGitHub({
          imageData,
          userId,
          fileExtension
        });
      }
      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error('GitHub profile image upload error:', error);
    return null;
  }
}
