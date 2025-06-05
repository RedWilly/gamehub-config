/**
 * Global Prisma Client instance
 * 
 * This singleton pattern prevents multiple instances of PrismaClient in development
 * and reuses a single connection throughout the application.
 */

import { PrismaClient } from "@prisma/client";

// Define global type for PrismaClient
declare global {
  var prisma: PrismaClient | undefined;
}

// Create or reuse PrismaClient instance
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

// Save PrismaClient to global object in development to prevent multiple instances
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
