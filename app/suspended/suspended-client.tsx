"use client";

import { useSession, useIsSuspended } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Client component for the suspended page UI
 * Handles session data and conditional rendering based on suspension status
 */
export default function SuspendedPageClient() {
  const { data: session } = useSession();
  const isSuspended = useIsSuspended();
  const router = useRouter();
  
  // Redirect non-suspended users to home after a short delay
  useEffect(() => {
    if (!isSuspended) {
      const redirectTimer = setTimeout(() => {
        router.push('/');
      }, 3000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isSuspended, router]);
  
  // Get suspendedUntil from the session data
  // The customSession plugin ensures this field is always available
  const suspendedUntil = session?.user?.suspendedUntil 
    ? new Date(session.user.suspendedUntil) 
    : null;
  
  const formattedDate = suspendedUntil 
    ? suspendedUntil.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "unknown date";

  // If user is not suspended, show active account message
  if (!isSuspended) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-center text-green-600 dark:text-green-400 mb-6">
            Account Active
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-center mb-6">
            Your account is currently active. You will be redirected to the home page.
          </p>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/">
                Go to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show suspended account message
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center text-red-600 dark:text-red-400 mb-6">
          Account Suspended
        </h1>
        
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Your account has been temporarily suspended due to a violation of our community guidelines.
          </p>
          
          {suspendedUntil && (
            <p className="text-gray-700 dark:text-gray-300">
              Your suspension will be lifted on:
              <span className="block mt-2 font-medium text-center">
                {formattedDate}
              </span>
            </p>
          )}
          
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            If you believe this is an error or would like to appeal this decision, please contact our support team.
          </p>
          
          <div className="flex justify-center mt-6">
            <Button asChild variant="outline">
              <Link href="/">
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
