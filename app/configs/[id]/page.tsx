/**
 * Config Details Page
 * Page for viewing a specific game configuration
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Edit, ThumbsUp, ThumbsDown, Clock, Tag, Download, History, RotateCcw, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Container } from "@/components/ui/container";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-client";
import { VoteButtons } from "@/components/configs/VoteButtons";
import { CommentList } from "@/components/comments/comment-list";

interface ConfigDetailsPageProps {
  params: {
    id: string;
  };
}

/**
 * ConfigDetailsPage component for viewing a specific game configuration
 * Fetches config data based on the id parameter
 * 
 * @param props - Component props containing route parameters
 * @returns React component
 */
export default function ConfigDetailsPage({ params }: ConfigDetailsPageProps): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [configData, setConfigData] = useState<any>(null);
  const [gameData, setGameData] = useState<any>(null);
  const [isReverting, setIsReverting] = useState<boolean>(false);
  const [userVote, setUserVote] = useState<number | null>(null);
  
  const router = useRouter();
  const { id } = params;
  const { data: session } = useSession();

  // Fetch config and game data when the component mounts
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (!id) {
        setError("No config ID provided");
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

        // If user is logged in, fetch their vote for this config
        if (session?.user) {
          try {
            const voteResponse = await fetch(`/api/configs/${id}/vote/user`);
            if (voteResponse.ok) {
              const voteData = await voteResponse.json();
              setUserVote(voteData.vote?.value || null);
            }
          } catch (voteError) {
            console.error("Error fetching user vote:", voteError);
            // Don't set an error state, just continue without the user's vote
          }
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load configuration data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, session]);

  // Check if the current user is the author of the config
  const isAuthor = session?.user?.id === configData?.userId;
  
  // Check if user has permission to revert versions (admin, mod, or author)
  const canRevertVersions = 
    session?.user?.role === "ADMIN" || 
    session?.user?.role === "MODERATOR" || 
    isAuthor;

  /**
   * Revert to a previous version of the configuration
   * 
   * @param versionId - ID of the version to revert to
   */
  const revertToVersion = async (versionId: string): Promise<void> => {
    if (!canRevertVersions) return;
    
    setIsReverting(true);
    
    try {
      const response = await fetch(`/api/configs/${id}/versions/${versionId}/revert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to revert to previous version");
      }
      
      // Refresh the page to show the reverted version
      toast.success("Successfully reverted to previous version");
      router.refresh();
      
      // Reload the data
      window.location.reload();
    } catch (error: any) {
      console.error("Error reverting version:", error);
      toast.error(error.message || "Failed to revert to previous version");
    } finally {
      setIsReverting(false);
    }
  };

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

  return (
    <Container>
      <div className="py-10">
        {/* Game and Config Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Game Image */}
          <div className="w-full md:w-1/4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg border">
              {gameData.imageUrl ? (
                <Image
                  src={gameData.imageUrl}
                  alt={gameData.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted">
                  <p className="text-muted-foreground">No image</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Config Info */}
          <div className="w-full md:w-3/4">
            <div className="flex flex-col h-full">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{gameData.name}</h1>
                <p className="text-muted-foreground">Steam ID: {gameData.steamId}</p>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {configData.tags && configData.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <p>Created by @{configData.createdBy?.username || "unknown"}</p>
                <span>•</span>
                <p>GameHub v{configData.gamehubVersion}</p>
                <span>•</span>
                <p>{format(new Date(configData.createdAt), "PPP")}</p>
              </div>
              
              <div className="mt-4 flex flex-wrap items-center gap-4">
                {/* Voting Buttons */}
                <VoteButtons
                  configId={id}
                  initialUpvotes={configData.upvotes}
                  initialDownvotes={configData.downvotes}
                  initialUserVote={userVote}
                />
                
                {/* Edit Button (only for author) */}
                {isAuthor && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/configs/edit/${id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                )}
              </div>
              
              {/* Legacy Config Badge */}
              {configData.isLegacy && (
                <div className="mt-4">
                  <Badge variant="destructive">Legacy Config</Badge>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This configuration has been replaced by a newer community-approved version.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Config Content Tabs */}
        <Tabs defaultValue="details" className="mt-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>Versions</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Comments</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Details Tab */}
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">General Configuration</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">GameHub Version</h4>
                    <p>{configData.gamehubVersion}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Game Resolution</h4>
                    <p>{configData.details?.gameResolution || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">DirectX Hub</h4>
                    <p>{configData.details?.directxHub || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Language</h4>
                    <p>{configData.details?.language || "Not specified"}</p>
                  </div>
                </div>
                
                {configData.details?.envVars && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Environment Variables</h4>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                      {configData.details.envVars}
                    </pre>
                  </div>
                )}
                
                {configData.details?.commandLine && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Command Line</h4>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                      {configData.details.commandLine}
                    </pre>
                  </div>
                )}
                
                {configData.videoUrl && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Video Tutorial</h4>
                    <div className="aspect-video relative">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYoutubeId(configData.videoUrl)}`}
                        className="absolute inset-0 w-full h-full rounded-md"
                        allowFullScreen
                        title="Video tutorial"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Compatibility Tab */}
          <TabsContent value="compatibility" className="mt-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Compatibility Settings</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Compatibility Layer</h4>
                    <p>{configData.details?.compatLayer || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">GPU Driver</h4>
                    <p>{configData.details?.gpuDriver || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Audio Driver</h4>
                    <p>{configData.details?.audioDriver || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">DXVK Version</h4>
                    <p>{configData.details?.dxvkVersion || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">VKD3D Version</h4>
                    <p>{configData.details?.vkd3dVersion || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">CPU Translator</h4>
                    <p>{configData.details?.cpuTranslator || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">CPU Core Limit</h4>
                    <p>{configData.details?.cpuCoreLimit || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">VRAM Limit</h4>
                    <p>{configData.details?.vramLimit || "Not specified"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Components Tab */}
          <TabsContent value="components" className="mt-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Additional Components</h3>
              </CardHeader>
              <CardContent>
                {configData.details?.components && configData.details.components.length > 0 ? (
                  <ul className="space-y-2">
                    {configData.details.components.map((component: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        <span>{component}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No additional components specified</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Versions Tab */}
          <TabsContent value="versions" className="mt-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Version History</h3>
                <p className="text-sm text-muted-foreground">
                  View and manage previous versions of this configuration
                </p>
              </CardHeader>
              <CardContent>
                {configData.versions && configData.versions.length > 0 ? (
                  <div className="space-y-4">
                    {configData.versions.map((version: any, index: number) => (
                      <div 
                        key={version.id} 
                        className={`p-4 rounded-lg border ${index === 0 ? 'bg-muted/50' : ''}`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant={index === 0 ? "default" : "outline"}>
                                v{version.versionNumber}
                              </Badge>
                              {index === 0 && (
                                <Badge variant="secondary">Current</Badge>
                              )}
                            </div>
                            
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">
                                {version.createdAt ? (
                                  <>
                                    {index === 0 ? 'Updated' : 'Created'} {format(new Date(version.createdAt), 'PPP')}
                                  </>
                                ) : 'Date unknown'}
                              </span>
                              
                              {version.updatedBy && (
                                <span className="ml-1 text-muted-foreground">
                                  by @{version.updatedBy.username || 'unknown'}
                                </span>
                              )}
                            </div>
                            
                            {version.changeSummary && (
                              <p className="mt-1 text-sm">{version.changeSummary}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2 md:mt-0">
                            {index !== 0 && canRevertVersions && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => revertToVersion(version.id)}
                                disabled={isReverting}
                              >
                                {isReverting ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                )}
                                Revert to this version
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No version history available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Comments Tab */}
          <TabsContent value="comments" className="mt-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Community Comments</h3>
                <p className="text-sm text-muted-foreground">
                  Share your thoughts and experiences with this configuration
                </p>
              </CardHeader>
              <CardContent>
                <CommentList configId={id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
}

/**
 * Extract YouTube video ID from URL
 * 
 * @param url - YouTube URL
 * @returns YouTube video ID or null if not found
 */
function getYoutubeId(url: string): string | null {
  if (!url) return null;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
}
