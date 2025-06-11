/**
 * Config Search Page
 * Page for searching and filtering game configurations
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, Filter, X } from "lucide-react";
import debounce from 'debounce';

import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { UserConfigList } from "@/components/configs/list/UserConfigList";

// Common tags for filtering
const COMMON_TAGS = [
  "Optimized for FPS",
  "Low-end Devices",
];

// Sort options
const SORT_OPTIONS = [
  { label: "Most Popular", value: "popular" },
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Recently Updated", value: "updated" }
];

/**
 * ConfigSearchPage component for searching and filtering configurations
 * 
 * @returns React component
 */
export default function ConfigSearchPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get search parameters from URL
  const initialQuery = searchParams.get("q") || "";
  const initialSort = searchParams.get("sort") || "popular";
  const initialTags = searchParams.get("tags")?.split(",") || [];
  
  // State for search parameters
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [configs, setConfigs] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);

  // Effect to fetch configurations based on search parameters from URL
  const fetchConfigs = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams(searchParams.toString());
      const response = await fetch(`/api/configs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch configurations");
      }
      
      const data = await response.json();
      setConfigs(data.configs);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error("Error fetching configurations:", err);
      setError(err.message || "Failed to load configurations");
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const updateURL = useCallback((newParams: Record<string, any>): void => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    router.push(`/search/configs?${params.toString()}`);
  }, [router, searchParams]);

  // Debounce search query updates
  useEffect(() => {
    const debouncedUpdate = debounce(() => {
      // We only update the URL if the query has actually changed from what's in the URL
      if (searchQuery !== (searchParams.get('q') || '')) {
        updateURL({ q: searchQuery, page: 1 });
      }
    }, 500);

    debouncedUpdate();

    // Cleanup function to cancel the debounced call if component unmounts or query changes
    return () => {
      debouncedUpdate.clear();
    };
  }, [searchQuery, searchParams, updateURL]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (value: string): void => {
    setSortBy(value);
    updateURL({ sort: value, page: 1 });
  };

  const toggleTag = (tag: string): void => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    updateURL({ tags: newTags.join(','), page: 1 });
  };

  const clearFilters = (): void => {
    setSearchQuery("");
    setSelectedTags([]);
    updateURL({ q: null, tags: null, page: 1 });
  };

  const handlePageChange = (newPage: number): void => {
    updateURL({ page: newPage });
  };

  return (
    <Container>
      <div className="py-10">
        <h1 className="text-3xl font-bold mb-6">Search Configurations</h1>
        
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by game name"
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Sheet open={false} onOpenChange={() => {}}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <Filter className="h-4 w-4 mr-2" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                  <div className="py-4">
                    <h4 className="text-sm font-medium mb-3">Tags</h4>
                    <div className="space-y-3">
                      {COMMON_TAGS.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox id={`mobile-tag-${tag}`} checked={selectedTags.includes(tag)} onCheckedChange={() => toggleTag(tag)} />
                          <label htmlFor={`mobile-tag-${tag}`} className="text-sm">{tag}</label>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-between">
                      <Button variant="outline" onClick={clearFilters}>Clear</Button>
                      <Button onClick={() => {}}>Apply</Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {selectedTags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => toggleTag(tag)} />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">Clear All</Button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          <div className="hidden md:block w-1/4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Filters</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Tags</h4>
                    <div className="space-y-3">
                      {COMMON_TAGS.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox id={`tag-${tag}`} checked={selectedTags.includes(tag)} onCheckedChange={() => toggleTag(tag)} />
                          <label htmlFor={`tag-${tag}`} className="text-sm">{tag}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <Button variant="outline" onClick={clearFilters} className="w-full">Clear Filters</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading configurations...</p>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : configs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-4">No configurations found.</p>
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <>
                <UserConfigList configs={configs} userName="" />
                {pagination && pagination.pages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => handlePageChange(pagination.page - 1)} 
                      disabled={pagination.page <= 1}
                    >
                      Previous
                    </Button>
                    <span>Page {pagination.page} of {pagination.pages}</span>
                    <Button 
                      variant="outline" 
                      onClick={() => handlePageChange(pagination.page + 1)} 
                      disabled={pagination.page >= pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
