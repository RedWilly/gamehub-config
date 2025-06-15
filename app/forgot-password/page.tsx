"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      const result = await authClient.forgetPassword({ 
        email,
        redirectTo: "/reset-password",
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
        toast.success("If the account exists, a reset link has been sent.");
        router.push("/signin");
      } else if (result && 'error' in result && result.error) {
        // Error case - error object exists
        const errorMessage = (result as any).error?.message || "Unable to send reset email. Try again later.";
        toast.error(errorMessage);
      } else {
        // Fallback for any other case
        console.log('Unexpected response structure:', result);
        toast.success("If the account exists, a reset link has been sent.");
        router.push("/signin");
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
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter the email associated with your account. We’ll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button disabled={loading} onClick={handleSubmit} className="w-full">
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Send reset link"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
