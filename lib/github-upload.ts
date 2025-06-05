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
 * 
 * @param options - Upload options containing image URL and file name
 * @returns Raw URL of the uploaded image or null if upload fails
 */
export async function uploadImageToGitHub(options: UploadImageOptions): Promise<string | null> {
  try {
    const { imageUrl, fileName } = options;
    
    // Fetch the image from URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image from ${imageUrl}`);
    }
    
    // Convert image to base64
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const content = buffer.toString('base64');
    
    // Check if file already exists
    let sha: string | undefined;
    try {
      const { data: existingFile } = await octokit.repos.getContent({
        owner,
        repo,
        path: `images/${fileName}`,
      });
      
      if ('sha' in existingFile) {
        sha = existingFile.sha;
      }
    } catch (error) {
      // File doesn't exist, which is fine
    }
    
    // Upload or update file in GitHub repository
    const response = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: `images/${fileName}`,
      message: `Upload game image for ${fileName}`,
      content,
      sha,
    });
    
    // Return raw URL to the image
    return `https://raw.githubusercontent.com/${owner}/${repo}/main/images/${fileName}`;
  } catch (error) {
    console.error('GitHub upload error:', error);
    return null;
  }
}
