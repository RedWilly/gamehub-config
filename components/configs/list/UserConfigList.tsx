/**
 * UserConfigList Component
 * Displays a list of configurations created by a specific user
 */

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ThumbsUp, ThumbsDown, Clock, Tag, ChevronRight } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Config {
  id: string;
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
  createdBy: {
    username: string;
    image?: string;
  };
  tags: string[];
}

interface UserConfigListProps {
  configs: Config[];
  userName: string;
}

/**
 * UserConfigList component for displaying a user's configurations
 * 
 * @param props - Component props
 * @returns React component
 */
export function UserConfigList({ configs, userName }: UserConfigListProps): JSX.Element {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">
          {userName}
        </h2>
      </div>
      
      <Separator />
      
      {configs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 max-w-3xl">
          {configs.map((config) => (
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
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Game Image */}
          <div className="flex-shrink-0">
            <div className="relative w-16 h-16 overflow-hidden rounded-md border">
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
          <div className="flex-grow min-w-0">
            <div className="flex flex-col justify-between h-full">
              {/* Top section: Title and Version */}
              <div>
                <h3 className="text-lg font-semibold truncate">
                  <Link 
                    href={`/configs/${config.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    {config.game.name} @{config.createdBy.username}
                  </Link>
                </h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <span>v{config.gamehubVersion}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-2">
                {config.tags?.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {config.tags?.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{config.tags.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Votes and Date */}
          <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4 text-green-500" />
                <span>{config.upvotes || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsDown className="h-4 w-4 text-red-500" />
                <span>{config.downvotes || 0}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{new Date(config.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/50 p-2 flex justify-end">
        <Link 
          href={`/configs/${config.id}`}
          className="text-xs font-medium text-primary flex items-center hover:underline"
        >
          View Details
          <ChevronRight className="h-3 w-3 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
}
