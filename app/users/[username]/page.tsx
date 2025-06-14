"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Loader2, User, Settings, Upload, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ProfileImageUploader } from "@/components/profile/profile-image-uploader";

interface ProfilePageProps {
  params: {
    username: string;
  };
}

/**
 * User profile page component
 * Displays user information, submitted configs, and recent activity
 */
export default function ProfilePage({ params }: ProfilePageProps) {
  const { username } = params;
  const { data: session, isPending: isSessionLoading } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  
  // Fetch profile data
  const fetchProfileData = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${username}?page=${page}&limit=6`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load profile data");
      }
      
      const data = await response.json();
      setProfileData(data);
      setCurrentPage(page);
      
      // Show toast notification for profile data loaded (only on first load)
      if (page === 1) {
        toast({
          title: "Profile loaded",
          description: `Viewing ${data.user.username}'s profile`,
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error("Error fetching profile data:", error);
      setError(error.message || "Failed to load profile data");
      
      // Show error toast
      toast({
        title: "Error loading profile",
        description: error.message || "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, [username]);
  
  // Handle image upload success
  const handleImageUploaded = (imageUrl: string) => {
    if (profileData && profileData.user) {
      setProfileData({
        ...profileData,
        user: {
          ...profileData.user,
          image: imageUrl
        }
      });
    }
    setIsUploaderOpen(false);
    toast({
      title: "Profile image updated",
      description: "Your profile image has been successfully updated.",
    });
  };
  
  // Get user initials for avatar fallback
  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'U';
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      return "Unknown date";
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <Container>
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading profile data...</p>
        </div>
      </Container>
    );
  }
  
  // Error state
  if (error || !profileData) {
    return (
      <Container>
        <div className="py-10">
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Error</h2>
                <p className="text-muted-foreground">{error || "Failed to load profile data"}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => router.push("/")}
                >
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }
  
  const { user, configs, comments, pagination, isOwnProfile } = profileData;
  
  return (
    <Container>
      <div className="py-10">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Profile Image */}
          <div className="w-full md:w-1/4 flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user.image || ''} alt={user.displayUsername || user.username} />
                <AvatarFallback className="text-2xl">
                  {getUserInitials(user.displayUsername || user.username)}
                </AvatarFallback>
              </Avatar>
              
              {isOwnProfile && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={() => setIsUploaderOpen(true)}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {isUploaderOpen && (
              <ProfileImageUploader
                onSuccess={handleImageUploaded}
                onCancel={() => setIsUploaderOpen(false)}
              />
            )}
            
            <div className="mt-4 text-center">
              <h1 className="text-2xl font-bold">
                {user.displayUsername || user.username}
              </h1>
              <p className="text-muted-foreground">@{user.username}</p>
              
              <div className="mt-2">
                <Badge variant="outline">
                  {user.role}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mt-2">
                Member since {formatDistanceToNow(user.createdAt, { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {/* Profile Content */}
          <div className="w-full md:w-3/4">
            <Tabs defaultValue="configs" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="configs">Configurations</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              </TabsList>
              
              {/* Configs Tab */}
              <TabsContent value="configs" className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Submitted Configurations</h2>
                
                {configs.length === 0 ? (
                  <Card>
                    <CardContent className="py-8">
                      <div className="text-center">
                        <p className="text-muted-foreground">No configurations submitted yet</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {configs.map((config: any) => (
                        <Link href={`/configs/${config.id}`} key={config.id}>
                          <Card className="h-full hover:border-primary transition-colors">
                            <CardContent className="p-0">
                              <div className="relative aspect-[3/2] w-full">
                                <Image
                                  src={config.game.imageUrl || '/placeholder-game.jpg'}
                                  alt={config.game.name}
                                  fill
                                  className="object-cover rounded-t-lg"
                                />
                              </div>
                            </CardContent>
                            <CardFooter className="flex flex-col items-start p-4">
                              <h3 className="font-medium line-clamp-1">{config.game.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">{config.title}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="flex items-center text-sm">
                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                  {config.upvotes}
                                </span>
                                <span className="flex items-center text-sm">
                                  <ThumbsDown className="h-3 w-3 mr-1" />
                                  {config.downvotes}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(config.createdAt)}
                                </span>
                              </div>
                            </CardFooter>
                          </Card>
                        </Link>
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {pagination.pages > 1 && (
                      <div className="flex justify-center mt-6">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => fetchProfileData(currentPage - 1)}
                          >
                            Previous
                          </Button>
                          
                          <div className="flex items-center text-sm px-2">
                            Page {currentPage} of {pagination.pages}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === pagination.pages}
                            onClick={() => fetchProfileData(currentPage + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
              
              {/* Activity Tab */}
              <TabsContent value="activity" className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                
                {comments.length === 0 ? (
                  <Card>
                    <CardContent className="py-8">
                      <div className="text-center">
                        <p className="text-muted-foreground">No recent activity</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment: any) => (
                      <Card key={comment.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm">
                                Commented on <Link href={`/configs/${comment.config.id}`} className="font-medium hover:underline">
                                  {comment.config.game.name}: {comment.config.title}
                                </Link>
                              </p>
                              <p className="mt-1 text-sm">{comment.content}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="flex items-center text-xs text-muted-foreground">
                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                  {comment.upvotes}
                                </span>
                                <span className="flex items-center text-xs text-muted-foreground">
                                  <ThumbsDown className="h-3 w-3 mr-1" />
                                  {comment.downvotes}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Container>
  );
}
