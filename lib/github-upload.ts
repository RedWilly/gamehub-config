/**
 * GitHub image upload utility
 * Uploads game images to GitHub repository and returns raw URL
 */

import { Octokit } from '@octokit/rest';

// Parse GitHub repo information from environment variable
const GITHUB_REPO = process.env.GITHUB_REPO || '';
const repoUrl = new URL(GITHUB_REPO);
const [, owner, repo] = repoUrl.pathname.split('/');

// Initialize Octokit with GitHub token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

interface UploadImageOptions {
  imageUrl: string;
  fileName: string;
}

/**
 * Uploads an image to GitHub repository
 * Handles existing files gracefully to prevent 409 conflicts
 * 
 * @param options - Upload options containing image URL and file name
 * @returns Raw URL of the uploaded image or null if upload fails
 */
export async function uploadImageToGitHub(options: UploadImageOptions): Promise<string | null> {
  try {
    const { imageUrl, fileName } = options;
    const path = `images/${fileName}`;
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
    
    // Check if file already exists
    try {
      const { data: existingFile } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });
      
      // If file exists, just return the URL without trying to upload again
      if ('sha' in existingFile) {
        console.log(`Image ${fileName} already exists in GitHub, using existing URL`);
        return rawUrl;
      }
    } catch (error) {
      // File doesn't exist, which is fine - we'll create it
      console.log(`Image ${fileName} doesn't exist in GitHub yet, will create it`);
    }
    
    // Fetch the image from URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image from ${imageUrl}`);
    }
    
    // Convert image to base64
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const content = buffer.toString('base64');
    
    // Upload file to GitHub repository
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Upload game image for ${fileName}`,
      content,
      // No SHA means create new file
    }).catch(error => {
      // If error is 409 (conflict), the file was created by another process
      if (error.status === 409) {
        console.log(`Conflict while uploading ${fileName}, another process likely created it`);
        return; // We'll return the raw URL anyway
      }
      throw error; // Re-throw other errors
    });
    
    // Return raw URL to the image
    return rawUrl;
  } catch (error) {
    console.error('GitHub upload error:', error);
    return null;
  }
}
