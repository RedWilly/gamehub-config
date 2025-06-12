"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Flag,
  Settings,
  ThumbsDown,
  ThumbsUp,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserTable } from "./users/user-table"; // Ensure this path is correct

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
    total: number;
    upvotes: number;
    downvotes: number;
  };
  reports: {
    total: number;
    open: number;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats.");
        }
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of platform activity and management tools.
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="configs">Configs</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {error && (
            <Card className="mb-8 bg-destructive/10 border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Error Fetching Stats</CardTitle>
                <CardDescription className="text-destructive/80">
                  {error}
                </CardDescription>
              </CardHeader>
            </Card>
          )}

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
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage all registered users.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* UserTable no longer needs the columns prop */}
              <UserTable /> 
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configs">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Management</CardTitle>
              <CardDescription>Manage all submitted configurations.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Configuration management interface will be built here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Report Management</CardTitle>
              <CardDescription>Review and manage user-submitted reports.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Report management interface will be built here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}