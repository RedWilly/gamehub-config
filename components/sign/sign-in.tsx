"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Loader2, Key } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your username below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="username"
                required
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                value={username}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
              </div>

              <Input
                id="password"
                type="password"
                placeholder="password"
                autoComplete="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  onClick={() => {
                    setRememberMe(!rememberMe);
                  }}
                />
                <Label htmlFor="remember">Remember me</Label>
              </div>

          

          <Button
              type="submit"
              className="w-full"
              disabled={loading}
              onClick={async () => {
                try {
                  setLoading(true);
                  const { data, error } = await signIn.username({
                    username,
                    password
                  });
                  
                  setLoading(false);
                  
                  if (error) {
                    toast.error(error.message || "Incorrect username or password. Please try again.");
                  } else {
                    toast.success("Login successful!");
                    router.push("/search/configs");
                  }
                } catch (err) {
                  setLoading(false);
                  toast.error("An error occurred during login. Please try again.");
                }
              }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <p> Login </p>
              )}
              </Button>

          

          <div className={cn(
              "w-full gap-2 flex items-center",
              "justify-between flex-col"
            )}>
              
				{/* <Button
                  variant="outline"
                  className={cn(
                    "w-full gap-2"
                  )}
                  disabled={loading}
                  onClick={async () => {
                    try {
                      setLoading(true);
                      await signIn.social({
                        provider: "github",
                        callbackURL: "/search/configs"
                      });
                    } catch (err) {
                      setLoading(false);
                      toast.error("An error occurred during GitHub login. Please try again.");
                    }
                  }}
                >
                  <svg
				xmlns="http://www.w3.org/2000/svg"
				width="1em"
				height="1em"
				viewBox="0 0 24 24"
			>
				<path
					fill="currentColor"
					d="m22.749 9.769l-.031-.08l-3.027-7.9a.79.79 0 0 0-.782-.495a.8.8 0 0 0-.456.17a.8.8 0 0 0-.268.408L16.14 8.125H7.865L5.822 1.872a.8.8 0 0 0-.269-.409a.81.81 0 0 0-.926-.05c-.14.09-.25.22-.312.376L1.283 9.684l-.03.08a5.62 5.62 0 0 0 1.864 6.496l.01.008l.028.02l4.61 3.453l2.282 1.726l1.39 1.049a.935.935 0 0 0 1.13 0l1.389-1.05l2.281-1.726l4.639-3.473l.011-.01A5.62 5.62 0 0 0 22.75 9.77"
				></path>
			</svg>
                  Sign in with GitHub
        </Button> */}
            </div>
        </div>
      </CardContent>
      
    </Card>
  );
}