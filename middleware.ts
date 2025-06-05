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

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/signin", "/signup", "/api/auth"];
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next();
  }

  // Check for session cookie (lightweight check without database query)
  const sessionCookie = getSessionCookie(request);
  
  // If no session cookie exists, redirect to sign in
  if (!sessionCookie) {
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
        return NextResponse.redirect(new URL("/signin", request.url));
      }
      
      const sessionData = await sessionResponse.json();
      
      // Check if user has admin role
      if (!sessionData.user || sessionData.user.role !== Role.ADMIN) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      
      // Check if user is suspended - safely handle the suspendedUntil field
      if (sessionData.user && 'suspendedUntil' in sessionData.user && 
          sessionData.user.suspendedUntil && 
          new Date(sessionData.user.suspendedUntil) > new Date()) {
        return NextResponse.redirect(new URL("/suspended", request.url));
      }
    } catch (error) {
      console.error("Admin role verification error:", error);
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
