"use client"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TowerControl } from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define extended user type to include the properties we need
interface ExtendedUser {
  suspendedUntil: Date | null;
  role: string | undefined;
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  username?: string;
  displayUsername?: string;
}

export function Header() {
  const { data: session, isPending } = useSession();
  
  // Only consider authenticated if session exists and has a user
  const isAuthenticated = Boolean(session?.user);
  
  /**
   * Gets the user's initials from their display name or username
   * @returns The user's initials or a fallback icon
   */
  const getUserInitials = (): string => {
    if (!session?.user) return 'U';
    
    // Cast the user to our extended type
    const user = session.user as ExtendedUser;
    const displayName = user.displayUsername || user.username || user.name;
    
    if (!displayName) return 'U';
    
    return displayName
      .split(' ')
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <TowerControl className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              GameHub Config
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/search/configs">Browse</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/submit">Submit</Link>
            </Button>
          </nav>
          <nav className="flex items-center space-x-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={session?.user?.image || ''} 
                        alt={(session?.user as ExtendedUser)?.displayUsername || 
                             (session?.user as ExtendedUser)?.username || 
                             'User'} 
                      />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {(session?.user as ExtendedUser)?.displayUsername || 
                         (session?.user as ExtendedUser)?.username || 
                         session?.user?.name}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/users/${(session?.user as ExtendedUser)?.username}`}>Profile</Link>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => signOut()}
                    className="cursor-pointer"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {/* <Button variant="ghost" asChild>
                  <Link href="/signin">Sign In</Link>
                </Button> */}
                <Button asChild>
                  <Link href="/signin">Sign In</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}