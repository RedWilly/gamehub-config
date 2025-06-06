/**
 * Config Search Page
 * Page for searching and filtering game configurations
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, Filter, X } from "lucide-react";

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
  "Stable Build",
  "High Performance",
  "Battery Efficient",
  "Controller Support",
  "Touchscreen Optimized"
];

// Sort options
const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Most Popular", value: "popular" },
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
  const initialSort = searchParams.get("sort") || "newest";
  const initialTags = searchParams.get("tags")?.split(",") || [];
  
  // State for search parameters
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [configs, setConfigs] = useState<any[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
  
  // Effect to fetch configurations based on search parameters
  useEffect(() => {
    const fetchConfigs = async (): Promise<void> => {
      setIsLoading(true);
      
      try {
        // Build query string
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        if (sortBy) params.set("sort", sortBy);
        if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
        
        const response = await fetch(`/api/configs/search?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch configurations");
        }
        
        const data = await response.json();
        setConfigs(data);
      } catch (err: any) {
        console.error("Error fetching configurations:", err);
        setError(err.message || "Failed to load configurations");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConfigs();
  }, [searchQuery, sortBy, selectedTags]);
  
  /**
   * Handle form submission for search
   * 
   * @param e - Form submit event
   */
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (sortBy) params.set("sort", sortBy);
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
    
    router.push(`/search/configs?${params.toString()}`);
  };
  
  /**
   * Toggle a tag selection
   * 
   * @param tag - Tag to toggle
   */
  const toggleTag = (tag: string): void => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  /**
   * Clear all filters
   */
  const clearFilters = (): void => {
    setSearchQuery("");
    setSortBy("newest");
    setSelectedTags([]);
    router.push("/search/configs");
  };
  
  return (
    <Container>
      <div className="py-10">
        <h1 className="text-3xl font-bold mb-6">Search Configurations</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by game name, config title, or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select
                value={sortBy}
                onValueChange={setSortBy}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Mobile Filter Button */}
              <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-4">Filter by Tags</h3>
                    <div className="space-y-3">
                      {COMMON_TAGS.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`mobile-tag-${tag}`}
                            checked={selectedTags.includes(tag)}
                            onCheckedChange={() => toggleTag(tag)}
                          />
                          <label
                            htmlFor={`mobile-tag-${tag}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {tag}
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 flex justify-between">
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                      <Button onClick={() => setIsFiltersOpen(false)}>
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <Button type="submit">
                Search
              </Button>
            </div>
          </div>
        </form>
        
        {/* Selected Filters */}
        {selectedTags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => toggleTag(tag)} 
                  />
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                Clear All
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Desktop Filters */}
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
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={selectedTags.includes(tag)}
                            onCheckedChange={() => toggleTag(tag)}
                          />
                          <label
                            htmlFor={`tag-${tag}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {tag}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Search Results */}
          <div className="flex-1">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading configurations...</p>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            ) : configs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-4">
                  No configurations found matching your search criteria.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <UserConfigList configs={configs} userName="" />
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
