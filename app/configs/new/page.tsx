/**
 * New Config Page
 * Page for creating a new game configuration
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfigForm } from "@/components/configs/form/ConfigForm";

/**
 * NewConfigPage component for creating a new game configuration
 * Fetches game data based on the steamId query parameter
 * 
 * @returns React component
 */
export default function NewConfigPage(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [gameData, setGameData] = useState<{
    id: string;
    steamId: string;
    name: string;
    imageUrl: string;
  } | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const steamId = searchParams.get("steamId");

  // Fetch game data when the component mounts
  useEffect(() => {
    const fetchGameData = async (): Promise<void> => {
      if (!steamId) {
        setError("No Steam ID provided");
        setIsLoading(false);
        return;
      }

      try {
        // First try to get the game from our database
        const response = await fetch(`/api/games/steam/${steamId}?cache=true`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch game data");
        }

        const data = await response.json();
        setGameData(data);
      } catch (err: any) {
        console.error("Error fetching game data:", err);
        setError(err.message || "Failed to load game data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameData();
  }, [steamId]);

  // If no steamId is provided, show an error
  if (!steamId && !isLoading) {
    return (
      <Container>
        <div className="py-10">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              No Steam ID provided. Please select a game first.
            </AlertDescription>
          </Alert>
        </div>
      </Container>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <Container>
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading game data...</p>
        </div>
      </Container>
    );
  }

  // Show error if game data couldn't be loaded
  if (error || !gameData) {
    return (
      <Container>
        <div className="py-10">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || "Failed to load game data. Please try again."}
            </AlertDescription>
          </Alert>
        </div>
      </Container>
    );
  }

  // Render the config form with the game data
  return (
    <Container>
      <div className="py-10">
        <h1 className="text-3xl font-bold mb-6">Create New Configuration</h1>
        <p className="text-muted-foreground mb-8">
          Fill out the form below to create a new configuration for {gameData.name}.
        </p>
        
        <ConfigForm 
          gameId={gameData.id}
          gameName={gameData.name}
          gameImageUrl={gameData.imageUrl}
        />
      </div>
    </Container>
  );
}
