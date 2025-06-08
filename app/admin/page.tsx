/**
 * Admin Dashboard Page
 * Overview of system statistics and recent activity
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  Settings, 
  BarChart3,
  Activity
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Interface for dashboard statistics
 */
interface DashboardStats {
  users: {
    total: number;
    new: number;
  };
  configs: {
    total: number;
    new: number;
  };
  votes: {
    upvotes: number;
    downvotes: number;
    total: number;
  };
  reports: {
    open: number;
    total: number;
  };
}

/**
 * Admin dashboard page component
 * 
 * @returns React component
 */
export default function AdminDashboardPage(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const router = useRouter();

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      try {
        // In a real implementation, this would fetch actual stats from an API
        // For now, we'll simulate a delay and use placeholder data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          users: {
            total: 250,
            new: 12,
          },
          configs: {
            total: 427,
            new: 24,
          },
          votes: {
            upvotes: 1243,
            downvotes: 187,
            total: 1430,
          },
          reports: {
            open: 5,
            total: 32,
          },
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of system statistics and recent activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.users.total}</div>
            )}
            {!isLoading && (
              <p className="text-xs text-muted-foreground">
                +{stats?.users.new} new this week
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => router.push("/admin/users")}>
              View All Users
            </Button>
          </CardFooter>
        </Card>

        {/* Configs Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Configs</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.configs.total}</div>
            )}
            {!isLoading && (
              <p className="text-xs text-muted-foreground">
                +{stats?.configs.new} new this week
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => router.push("/configs")}>
              View All Configs
            </Button>
          </CardFooter>
        </Card>

        {/* Votes Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.votes.total}</div>
            )}
            {!isLoading && (
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-xs">
                  <ThumbsUp className="h-3 w-3 text-green-500" />
                  <span>{stats?.votes.upvotes}</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <ThumbsDown className="h-3 w-3 text-red-500" />
                  <span>{stats?.votes.downvotes}</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => router.push("/admin/votes")}>
              Manage Votes
            </Button>
          </CardFooter>
        </Card>

        {/* Reports Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Reports</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.reports.open}</div>
            )}
            {!isLoading && (
              <p className="text-xs text-muted-foreground">
                {stats?.reports.total} total reports
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => router.push("/admin/reports")}>
              Review Reports
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Activity Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            ) : (
              <div className="divide-y">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">New config submitted</p>
                    <p className="text-sm text-muted-foreground">User: @johndoe</p>
                  </div>
                  <p className="text-sm text-muted-foreground">5 minutes ago</p>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">New report submitted</p>
                    <p className="text-sm text-muted-foreground">Reported by: @alice</p>
                  </div>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">User registered</p>
                    <p className="text-sm text-muted-foreground">Username: @newuser123</p>
                  </div>
                  <p className="text-sm text-muted-foreground">5 hours ago</p>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">Config version reverted</p>
                    <p className="text-sm text-muted-foreground">By moderator: @moduser</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Yesterday</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
