import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { Role } from "@prisma/client";

/**
 * Middleware for role-based access control in GameHub Configuration Directory
 * 
 * This middleware:
 * 1. Allows public routes to be accessed without authentication
 * 2. Redirects unauthenticated users to sign in
 * 3. Enforces role-based access to protected routes (admin)
 * 4. Handles suspended users
 */
export async function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api/");

  // Public routes that don't require authentication
  const publicRoutes = [
    // API routes
    "/api/auth",
    "/api/users",       // Allow public access to users API
    "/api/configs",     // Allow public access to configs API
    "/api/games",       // Allow public access to games API
  
    // Page routes
    "/", 
    "/signin", 
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/users",           // Allow public access to users listing
    "/configs",         // Allow public access to configs listing
    "/search/configs",  // Allow public access to configs search
    "/games",           // Allow public access to games listing
  ];
  
  
  // Check if the path is a public route or a specific config/game view
  if (
    publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/")) ||
    pathname.match(/^\/configs\/[^\/]+$/) || // Allow access to individual config pages
    pathname.match(/^\/api\/configs\/[^\/]+$/) || // Allow access to individual config API endpoints (GET only)
    pathname.match(/^\/games\/[^\/]+$/) || // Allow access to individual game pages
    pathname.match(/^\/api\/games\/[^\/]+$/) // Allow access to individual game API endpoints (GET only)
  ) {
    // For API config/game endpoints, only allow GET requests without authentication
    if ((pathname.startsWith("/api/configs/") || pathname.startsWith("/api/games/")) && request.method !== "GET") {
      // For non-GET methods on config/game endpoints, check authentication
      const sessionCookie = getSessionCookie(request);
      if (!sessionCookie) {
        // Return JSON response for API routes instead of redirecting
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.next();
  }

  // Check for session cookie (lightweight check without database query)
  const sessionCookie = getSessionCookie(request);
  
  // If no session cookie exists, handle differently based on route type
  if (!sessionCookie) {
    // For API routes, return a JSON response instead of redirecting
    if (isApiRoute) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    // For page routes, redirect to sign in
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // For admin routes, we need to verify the user's role
  // This requires a full session check with API call
  if (pathname.startsWith("/admin")) {
    try {
      // Make API call to get session data including user role
      const sessionResponse = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      });
      
      if (!sessionResponse.ok) {
        if (isApiRoute) {
          return NextResponse.json(
            { error: "Authentication failed" },
            { status: 401 }
          );
        }
        return NextResponse.redirect(new URL("/signin", request.url));
      }
      
      const sessionData = await sessionResponse.json();
      
      // Check if user has admin role
      if (!sessionData.user || sessionData.user.role !== Role.ADMIN) {
        if (isApiRoute) {
          return NextResponse.json(
            { error: "Admin access required" },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL("/", request.url));
      }
      
      // Check if user is suspended - safely handle the suspendedUntil field
      if (sessionData.user && 'suspendedUntil' in sessionData.user && 
          sessionData.user.suspendedUntil && 
          new Date(sessionData.user.suspendedUntil) > new Date()) {
        if (isApiRoute) {
          return NextResponse.json(
            { error: "Account suspended" },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL("/suspended", request.url));
      }
    } catch (error) {
      console.error("Admin role verification error:", error);
      if (isApiRoute) {
        return NextResponse.json(
          { error: "Authentication error" },
          { status: 500 }
        );
      }
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  // User is authenticated with valid session cookie, proceed
  return NextResponse.next();
}

// Configure which routes the middleware applies to
export const config = {
  matcher: [
    // Apply to all routes except static files and images
    "/((?!_next/static|_next/image|favicon.ico|images).*)",
  ],
};
