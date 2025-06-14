"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ProfileImageUploaderProps {
  onSuccess: (imageUrl: string) => void;
  onCancel: () => void;
}

/**
 * Component for uploading profile images
 * Allows users to select, preview, and upload profile images
 */
export function ProfileImageUploader({ onSuccess, onCancel }: ProfileImageUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  /**
   * Handles file selection
   * 
   * @param e - Change event from file input
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file (JPEG, PNG, GIF, or WEBP).",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  /**
   * Triggers the file input click
   */
  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };
  
  /**
   * Uploads the selected image to the server
   */
  const handleUpload = async () => {
    if (!selectedImage) return;
    
    try {
      setIsUploading(true);
      
      // Get file extension from data URL
      const fileExtension = selectedImage.split(';')[0].split('/')[1];
      
      // Send the image data to the server
      const response = await fetch('/api/users/profile-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: selectedImage,
          fileExtension,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
      
      const data = await response.json();
      // Show success toast
      toast({
        title: "Image uploaded",
        description: "Your profile image will be updated shortly.",
        variant: "default",
      });
      onSuccess(data.imageUrl);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mt-4">
      <CardHeader>
        <CardTitle className="text-center">Upload Profile Image</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedImage ? (
          <div className="relative w-full aspect-square max-w-[200px] mx-auto">
            <Image
              src={selectedImage}
              alt="Profile preview"
              fill
              className="object-cover rounded-md"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 rounded-full"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div 
            className="border-2 border-dashed border-muted-foreground/20 rounded-md p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={handleSelectClick}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to select an image or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPEG, PNG, GIF or WEBP (max 2MB)
            </p>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isUploading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={!selectedImage || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
