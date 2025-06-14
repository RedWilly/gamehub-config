/**
 * React hook for managing game configurations
 * Provides functions for creating, fetching, updating, and deleting configs
 */

import { useState } from "react";
import { 
  type CreateConfigInput, 
  type UpdateConfigInput, 
  type ConfigWithDetails, 
  type PaginatedConfigs 
} from "@/lib/validations/config";

/**
 * Hook for managing game configurations
 * 
 * @returns Object containing config management functions and state
 */
export function useConfig() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Creates a new game configuration
   * 
   * @param data - Configuration data to create
   * @returns The created config or null if creation failed
   */
  const createConfig = async (data: CreateConfigInput): Promise<ConfigWithDetails | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/configs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create configuration");
      }
      
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches a configuration by ID or slug
   * 
   * @param idOrSlug - Config ID or slug
   * @returns The config with details or null if not found
   */
  const getConfig = async (idOrSlug: string): Promise<ConfigWithDetails | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/configs/${idOrSlug}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch configuration");
      }
      
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches configurations for a specific game
   * 
   * @param gameId - Game ID
   * @param page - Page number (default: 1)
   * @param limit - Number of configs per page (default: 20)
   * @returns Paginated list of configs or null if fetch failed
   */
  const getConfigsByGame = async (
    gameId: string, 
    page = 1, 
    limit = 20
  ): Promise<PaginatedConfigs<ConfigWithDetails> | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/configs?gameId=${gameId}&page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch configurations");
      }
      
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches configurations created by a specific user
   * 
   * @param userId - User ID
   * @param page - Page number (default: 1)
   * @param limit - Number of configs per page (default: 20)
   * @returns Paginated list of configs or null if fetch failed
   */
  const getConfigsByUser = async (
    userId: string, 
    page = 1, 
    limit = 20
  ): Promise<PaginatedConfigs<ConfigWithDetails> | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/configs?userId=${userId}&page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch configurations");
      }
      
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Updates an existing configuration
   * 
   * @param configId - Config ID
   * @param data - Updated config data
   * @returns The updated config or null if update failed
   */
  const updateConfig = async (
    configId: string, 
    data: UpdateConfigInput
  ): Promise<ConfigWithDetails | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/configs/${configId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update configuration");
      }
      
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Deletes a configuration
   * 
   * @param configId - Config ID
   * @returns True if deletion was successful, false otherwise
   */
  const deleteConfig = async (configId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/configs/${configId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete configuration");
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createConfig,
    getConfig,
    getConfigsByGame,
    getConfigsByUser,
    updateConfig,
    deleteConfig,
    isLoading,
    error,
  };
}
