/**
 * Config Details Page
 * Page for viewing a specific game configuration
 * This is a server component that fetches data server-side for better SEO
 */

import Image from "next/image";
import Link from "next/link";
import { Loader2, Edit, Tag, History, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";

import { Container } from "@/components/ui/container";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VoteButtonsServer } from "@/components/configs/VoteButtonsServer";
import { CommentListServer } from "@/components/comments/comment-list-server";
import { ConfigVersionControls } from "@/components/configs/config-version-controls";

// Types for our data
type ConfigData = any; // Replace with proper type from your schema
type GameData = any; // Replace with proper type from your schema

interface ConfigDetailsPageProps {
  params: {
    id: string;
  };
}

/**
 * Generate metadata for the page based on the config data
 * This improves SEO by providing accurate page titles, descriptions, and OpenGraph data
 */
export async function generateMetadata(
  { params }: ConfigDetailsPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  
  try {
    // Fetch config data
    const config = await prisma.config.findUnique({
      where: { id },
      include: {
        game: true,
        createdBy: true,
      },
    });
    
    if (!config) {
      return {
        title: "Configuration Not Found",
        description: "The requested game configuration could not be found.",
      };
    }
    
    // Construct metadata
    return {
      title: `${config.game.name} GameHub Config by ${config.createdBy.username} | GameHub Config Directory`,
      description: `Optimized GameHub configuration for ${config.game.name}. GameHub version: ${config.gamehubVersion}`,
      openGraph: {
        title: `${config.game.name} GameHub Config by ${config.createdBy.username} | GameHub Config Directory`,
        description: `Optimized GameHub configuration for ${config.game.name}. GameHub version: ${config.gamehubVersion}`,
        images: [config.game.imageUrl],
        type: "article",
      },
      // Add structured data for search engines
      other: {
        "script:ld+json": JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": `GameHub Config for ${config.game.name}`,
          "applicationCategory": "Game",
          "operatingSystem": "Android",
          "author": {
            "@type": "Person",
            "name": config.createdBy.username
          },
          "datePublished": config.createdAt,
          "dateModified": config.updatedAt,
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": config.upvotes > 0 ? (config.upvotes / (config.upvotes + config.downvotes)) * 5 : 0,
            "ratingCount": config.upvotes + config.downvotes,
            "bestRating": "5",
            "worstRating": "1"
          }
        })
      }
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "GameHub Config | GameHub Config Directory",
      description: "View optimized game configurations for GameHub emulator",
    };
  }
}

/**
 * ConfigDetailsPage component for viewing a specific game configuration
 * Server component that fetches data server-side for better SEO
 * 
 * @param props - Component props containing route parameters
 * @returns React component
 */
export default async function ConfigDetailsPage({ params }: ConfigDetailsPageProps): Promise<JSX.Element> {
  const { id } = params;
  
  // Get current session
  const session = await auth.api.getSession({
    headers: headers()
  });
  
  // Fetch data server-side
  let configData: ConfigData | null = null;
  let gameData: GameData | null = null;
  let error: string | null = null;
  let userVote: number | null = null;
  
  try {
    // Fetch config with details, versions, and creator info
    configData = await prisma.config.findUnique({
      where: { id },
      include: {
        details: true,
        createdBy: true,
        versions: {
          include: {
            updatedBy: true,
          },
          orderBy: {
            versionNumber: 'desc',
          },
        },
      },
    });
    
    if (!configData) {
      throw new Error("Configuration not found");
    }
    
    // Fetch game data
    gameData = await prisma.game.findUnique({
      where: { id: configData.gameId },
    });
    
    if (!gameData) {
      throw new Error("Game data not found");
    }
    
    // If user is logged in, fetch their vote for this config
    if (session?.user) {
      const vote = await prisma.vote.findUnique({
        where: {
          userId_configId: {
            userId: session.user.id,
            configId: id,
          },
        },
      });
      
      userVote = vote?.value || null;
    }
  } catch (err: any) {
    console.error("Error fetching data:", err);
    error = err.message || "Failed to load configuration data";
  }
  
  // Check if the current user is the author of the config
  const isAuthor = session?.user?.id === configData?.userId;
  
  // Check if user has permission to revert versions (admin, mod, or author)
  const canRevertVersions = 
    session?.user?.role === "ADMIN" || 
    session?.user?.role === "MODERATOR" || 
    isAuthor;

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
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Game Image */}
          <div className="w-full md:w-[45%] lg:w-[40%] flex items-start">
            <div className="relative w-full aspect-[16/9] md:aspect-[4/3] overflow-hidden">
              {gameData.imageUrl ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={gameData.imageUrl}
                    alt={gameData.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 45vw, 40vw"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No image</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Config Info */}
          <div className="w-full md:w-[55%] lg:w-[60%] flex flex-col justify-start">
            <div className="flex flex-col">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{gameData.name}</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Steam ID: {gameData.steamId}</p>
              </div>
              
              <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                {configData.tags && configData.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <p>Created by {configData.createdBy?.username ? (
                  <Link href={`/users/${configData.createdBy.username}`} className="hover:underline">
                    @{configData.createdBy.username}
                  </Link>
                ) : "unknown"}</p>
                <span>•</span>
                <p>GameHub v{configData.gamehubVersion}</p>
                <span>•</span>
                <p>{formatDistanceToNow(new Date(configData.createdAt), { addSuffix: true })}</p>
              </div>
              
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-3 sm:gap-4">
                {/* Voting Buttons */}
                <VoteButtonsServer
                  configId={id}
                  initialUpvotes={configData.upvotes}
                  initialDownvotes={configData.downvotes}
                  initialUserVote={userVote}
                  userId={session?.user?.id}
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
                <div className="mt-3 sm:mt-4">
                  <Badge variant="destructive">Legacy Config</Badge>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    This configuration has been replaced by a newer community-approved version.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Config Content Tabs */}
        <Tabs defaultValue="details" className="mt-6 sm:mt-8">
          <div className="overflow-x-auto pb-2">
            <TabsList className="grid min-w-[600px] sm:min-w-full grid-cols-5">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="versions" className="flex items-center gap-1 sm:gap-2">
                <History className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="whitespace-nowrap">Versions</span>
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-1 sm:gap-2">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="whitespace-nowrap">Comments</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Details Tab */}
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">General Configuration</h3>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                  <div className="mt-3 sm:mt-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Environment Variables</h4>
                    <pre className="bg-muted p-2 sm:p-3 rounded-md text-xs sm:text-sm overflow-x-auto">
                      {configData.details.envVars}
                    </pre>
                  </div>
                )}
                
                {configData.details?.commandLine && (
                  <div className="mt-3 sm:mt-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Command Line</h4>
                    <pre className="bg-muted p-2 sm:p-3 rounded-md text-xs sm:text-sm overflow-x-auto">
                      {configData.details.commandLine}
                    </pre>
                  </div>
                )}
                
                {configData.videoUrl && (
                  <div className="mt-4 sm:mt-6">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Video Tutorial</h4>
                    <div className="aspect-video relative rounded-md overflow-hidden">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYoutubeId(configData.videoUrl)}`}
                        className="absolute inset-0 w-full h-full"
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
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                  <div className="space-y-3 sm:space-y-4">
                    {configData.versions.map((version: any, index: number) => (
                      <div 
                        key={version.id} 
                        className={`p-3 sm:p-4 rounded-lg border ${index === 0 ? 'bg-muted/50' : ''}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant={index === 0 ? "default" : "outline"}>
                                v{version.versionNumber}
                              </Badge>
                              {index === 0 && (
                                <Badge variant="secondary">Current</Badge>
                              )}
                            </div>
                            
                            <div className="mt-1 sm:mt-2 text-xs sm:text-sm">
                              <span className="text-muted-foreground">
                                {version.createdAt ? (
                                  <>
                                    {index === 0 ? 'Updated' : 'Created'} {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
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
                              <p className="mt-1 text-xs sm:text-sm">{version.changeSummary}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            {index !== 0 && canRevertVersions && (
                              <ConfigVersionControls
                                versionId={version.id}
                                configId={id}
                                isReverting={false}
                              />
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
                <CommentListServer configId={id} />
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
