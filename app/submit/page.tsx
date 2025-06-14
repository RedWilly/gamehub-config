"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GameData {
  name: string;
  steam_appid: number;
  header_image: string;
}

export default function SubmitPage() {
  const [steamId, setSteamId] = useState("");
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFetchGameData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!steamId) {
      setError("Please enter a Steam App ID.");
      toast.error("Missing Steam ID", {
        description: "Please enter a Steam App ID."
      });
      return;
    }

    setIsLoading(true);
    setGameData(null);
    setError(null);

    try {
      const response = await fetch(`/api/games/steam/${steamId}?cache=true`);
      if (!response.ok) {
        throw new Error(`Game not found or failed to fetch data. Status: ${response.status}`);
      }
      const apiResponseData = await response.json();

      if (!apiResponseData || typeof apiResponseData.name !== 'string' || 
          typeof apiResponseData.steamId !== 'string' || typeof apiResponseData.imageUrl !== 'string') {
        console.error("Received unexpected data structure from API:", apiResponseData);
        throw new Error("Invalid data format received from the game API.");
      }
      
      const steamAppIdNum = parseInt(apiResponseData.steamId, 10);
      if (isNaN(steamAppIdNum)) {
        console.error("Steam ID from API is not a valid number:", apiResponseData.steamId);
        throw new Error("Invalid Steam ID format in API response.");
      }

      setGameData({
        name: apiResponseData.name,
        steam_appid: steamAppIdNum,
        header_image: apiResponseData.imageUrl,
      });
      
      // Show success toast when game is found
      toast.success("Game found", {
        description: `Found ${apiResponseData.name}`
      });
    } catch (err: any) {
      console.error("Error fetching or processing game data:", err);
      setError(err.message || "An unexpected error occurred.");
      // Show error toast
      toast.error("Game search failed", {
        description: err.message || "Failed to find game with this Steam ID"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (gameData) {
      router.push(`/configs/new?steamId=${gameData.steam_appid}`);
    }
  };

  return (
    <Container>
      <div className="py-10 flex justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Submit a New Configuration</CardTitle>
            <CardDescription>
              Enter the Steam App ID of the game to create a new configuration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFetchGameData} className="space-y-4">
              <Input
                type="text"
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
                placeholder="Enter Steam App ID (e.g., 1259970)"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Find Game"}
              </Button>
            </form>

            {error && <p className="mt-4 text-center text-red-500">{error}</p>}

            {gameData && (
              <div className="mt-6 text-center">
                <h3 className="text-xl font-bold">{gameData.name}</h3>
                <p className="text-muted-foreground">Steam ID: {gameData.steam_appid}</p>
                <div className="relative aspect-video mt-2 rounded-md overflow-hidden">
                    <Image 
                        src={gameData.header_image}
                        alt={gameData.name}
                        fill
                        className="object-cover"
                    />
                </div>
                <Button onClick={handleNext} className="mt-4 w-full">
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
