/**
 * Client-side config version controls component
 * Handles reverting to previous versions of a configuration
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ConfigVersionControlsProps {
  configId: string;
  versionId: string;
  isReverting: boolean;
}

/**
 * Client component that handles version history controls
 * Provides functionality to revert to previous versions
 */
export function ConfigVersionControls({
  configId,
  versionId,
  isReverting: initialIsReverting,
}: ConfigVersionControlsProps) {
  const [isReverting, setIsReverting] = useState<boolean>(initialIsReverting);
  const router = useRouter();

  /**
   * Revert to a previous version of the configuration
   */
  const revertToVersion = async (): Promise<void> => {
    setIsReverting(true);
    
    try {
      const response = await fetch(`/api/configs/${configId}/versions/${versionId}/revert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to revert to previous version");
      }
      
      // Show success message and refresh the page
      toast.success("Successfully reverted to previous version");
      router.refresh();
    } catch (error: any) {
      console.error("Error reverting version:", error);
      toast.error(error.message || "Failed to revert to previous version");
    } finally {
      setIsReverting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={revertToVersion}
      disabled={isReverting}
    >
      {isReverting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <RotateCcw className="h-4 w-4 mr-2" />
      )}
      Revert to this version
    </Button>
  );
}
