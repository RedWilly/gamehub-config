/**
 * Edit Config Page
 * Page for editing an existing game configuration
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Container } from "@/components/ui/container";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfigForm } from "@/components/configs/form/ConfigForm";

interface EditConfigPageProps {
  params: {
    id: string;
  };
}

/**
 * EditConfigPage component for editing an existing game configuration
 * Fetches config data based on the id parameter
 * 
 * @param props - Component props containing route parameters
 * @returns React component
 */
export default function EditConfigPage({ params }: EditConfigPageProps): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [configData, setConfigData] = useState<any>(null);
  const [gameData, setGameData] = useState<{
    id: string;
    steamId: string;
    name: string;
    imageUrl: string;
  } | null>(null);

  const router = useRouter();
  const { id } = params;

  // Fetch config and game data when the component mounts
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (!id) {
        setError("No config ID provided");
        toast.error("Configuration Error", {
          description: "No configuration ID was provided"
        });
        setIsLoading(false);
        return;
      }

      try {
        // Fetch config data
        const configResponse = await fetch(`/api/configs/${id}`);
        
        if (!configResponse.ok) {
          throw new Error("Failed to fetch configuration data");
        }

        const configData = await configResponse.json();
        setConfigData(configData);

        // Fetch game data
        const gameResponse = await fetch(`/api/games/${configData.gameId}`);
        
        if (!gameResponse.ok) {
          throw new Error("Failed to fetch game data");
        }

        const gameData = await gameResponse.json();
        setGameData(gameData);
        
        toast.info("Configuration loaded", {
          description: `Editing configuration for ${gameData.name}`
        });
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load configuration data");
        toast.error("Loading Error", {
          description: err.message || "Failed to load configuration data"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Show loading state
  if (isLoading) {
    return (
      <Container>
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading configuration data...</p>
        </div>
      </Container>
    );
  }

  // Show error if data couldn't be loaded
  if (error || !configData || !gameData) {
    return (
      <Container>
        <div className="py-10">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || "Failed to load configuration data. Please try again."}
            </AlertDescription>
          </Alert>
        </div>
      </Container>
    );
  }

  // Render the config form with the config and game data
  return (
    <Container>
      <div className="py-10">
        <h1 className="text-3xl font-bold mb-6">Edit Configuration</h1>
        <p className="text-muted-foreground mb-8">
          Edit your configuration for {gameData.name}.
        </p>
        
        <ConfigForm 
          gameId={gameData.id}
          gameName={gameData.name}
          gameImageUrl={gameData.imageUrl}
          configId={configData.id}
          defaultValues={{
            gameId: configData.gameId,
            gamehubVersion: configData.gamehubVersion,
            videoUrl: configData.videoUrl || "",
            tags: configData.tags || [],
            details: configData.details || {}
          }}
          isEditing={true}
        />
      </div>
    </Container>
  );
}
