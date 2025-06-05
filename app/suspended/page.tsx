import { Metadata } from "next";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useIsSuspended } from "@/lib/auth-client"; // Import the new hook

/**
 * Page displayed when a user is suspended
 * Shows suspension details and when they can return
 */
export const metadata: Metadata = {
  title: "Account Suspended - GameHub Configuration Directory",
  description: "Your account has been temporarily suspended",
};

export default function SuspendedPage() {
  const { data: session } = useSession();
  const isSuspended = useIsSuspended(); // Use the new hook
  
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

  // If user is not suspended, redirect them to home
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
