"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing token");
      router.replace("/auth/signin");
    }
  }, [token, router]);

  const handleSubmit = async () => {
    if (!token) return;

    if (!password || password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    
    try {
      setLoading(true);
      const result = await authClient.resetPassword({
        token,
        newPassword: password,
      });
      
      setLoading(false);

      // Handle the response based on the actual structure
      if (result && 
          typeof result === 'object' && 
          'data' in result && 
          result.data && 
          typeof result.data === 'object' && 
          'status' in result.data && 
          result.data.status === true) {
        // Success case - status is true inside data object
        toast.success("Password reset successfully. You can now log in.");
        router.replace("/signin");
      } else if (result && 'error' in result && result.error) {
        // Error case - error object exists
        const errorMessage = (result as any).error?.message || "Failed to reset password. Token may be invalid or expired.";
        toast.error(errorMessage);
      } else {
        // Fallback for any other case
        console.log('Unexpected response structure:', result);
        toast.error("Failed to reset password. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Password reset error:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set a new password</CardTitle>
          <CardDescription>
            Choose a strong password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button disabled={loading} onClick={handleSubmit} className="w-full">
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Reset password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
