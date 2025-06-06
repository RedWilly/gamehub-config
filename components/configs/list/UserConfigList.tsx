/**
 * UserConfigList Component
 * Displays a list of configurations created by a specific user
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ThumbsUp, ThumbsDown, Clock, Tag, ChevronRight } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface Config {
  id: string;
  title: string;
  gamehubVersion: string;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  gameId: string;
  game: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  tags: string[];
}

interface UserConfigListProps {
  configs: Config[];
  userName: string;
}

type SortOption = "newest" | "oldest" | "popular" | "updated";

/**
 * UserConfigList component for displaying a user's configurations with sorting options
 * 
 * @param props - Component props
 * @returns React component
 */
export function UserConfigList({ configs, userName }: UserConfigListProps): JSX.Element {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const router = useRouter();

  /**
   * Sort configurations based on the selected sort option
   * 
   * @param configs - List of configurations to sort
   * @param sortBy - Sort option
   * @returns Sorted list of configurations
   */
  const sortConfigs = (configs: Config[], sortBy: SortOption): Config[] => {
    switch (sortBy) {
      case "newest":
        return [...configs].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return [...configs].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "popular":
        return [...configs].sort(
          (a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
        );
      case "updated":
        return [...configs].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      default:
        return configs;
    }
  };

  const sortedConfigs = sortConfigs(configs, sortBy);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">
          {userName}'s Configurations
        </h2>
        
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as SortOption)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="updated">Recently Updated</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Separator />
      
      {sortedConfigs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {sortedConfigs.map((config) => (
            <UserConfigCard key={config.id} config={config} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No configurations created yet.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * UserConfigCard component for displaying a single configuration with game info
 * 
 * @param props - Component props
 * @returns React component
 */
function UserConfigCard({ config }: { config: Config }): JSX.Element {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Game Image */}
          <div className="w-full md:w-1/6">
            <div className="relative aspect-[3/4] overflow-hidden rounded-md border">
              {config.game.imageUrl ? (
                <Image
                  src={config.game.imageUrl}
                  alt={config.game.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground text-xs">No image</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Config Details */}
          <div className="w-full md:w-5/6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  <Link 
                    href={`/configs/${config.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    {config.title || "Configuration"}
                  </Link>
                </h3>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Link 
                    href={`/games/${config.game.id}`}
                    className="hover:underline"
                  >
                    {config.game.name}
                  </Link>
                  <span className="mx-2">•</span>
                  <span>GameHub {config.gamehubVersion}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {config.tags?.slice(0, 5).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {config.tags?.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{config.tags.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                    <span>{config.upvotes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                    <span>{config.downvotes || 0}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(config.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/50 p-4 flex justify-end">
        <Link 
          href={`/configs/${config.id}`}
          className="text-sm font-medium text-primary flex items-center hover:underline"
        >
          View Details
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
}
