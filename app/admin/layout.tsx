/**
 * Admin Layout
 * Provides consistent layout and navigation for admin pages
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  ThumbsUp, 
  Flag, 
  AlertTriangle, 
  ChevronRight,
  LogOut
} from "lucide-react";

import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { Role } from "@prisma/client";

/**
 * Navigation item interface
 */
interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles: Role[];
}

/**
 * Admin layout props
 */
interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin navigation items
 */
const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["ADMIN", "MODERATOR"],
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />,
    roles: ["ADMIN"],
  },
  {
    title: "Votes",
    href: "/admin/votes",
    icon: <ThumbsUp className="h-5 w-5" />,
    roles: ["ADMIN", "MODERATOR"],
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: <Flag className="h-5 w-5" />,
    roles: ["ADMIN", "MODERATOR"],
  },
  {
    title: "System Settings",
    href: "/admin/settings",
    icon: <Settings className="h-5 w-5" />,
    roles: ["ADMIN"],
  },
];

/**
 * Admin layout component
 * 
 * @param props - Component props
 * @returns React component
 */
export default function AdminLayout({ children }: AdminLayoutProps): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  
  // Check if user is authorized to access admin pages
  useEffect(() => {
    if (isPending) return;
    
    if (!session) {
      router.push("/login?callbackUrl=/admin");
      return;
    }
    
    const userRole = session.user.role as Role;
    const isAdmin = userRole === "ADMIN";
    const isModerator = userRole === "MODERATOR";
    
    if (!isAdmin && !isModerator) {
      router.push("/");
      return;
    }
    
    setIsAuthorized(true);
    setIsLoading(false);
  }, [session, isPending, router]);
  
  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) => {
    if (!session?.user?.role) return false;
    return item.roles.includes(session.user.role as Role);
  });
  
  // Show loading state
  if (isLoading) {
    return (
      <Container>
        <div className="py-10 flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading admin panel...</p>
          </div>
        </div>
      </Container>
    );
  }
  
  // Show unauthorized state
  if (!isAuthorized) {
    return (
      <Container>
        <div className="py-10">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
                <p className="text-center text-muted-foreground">
                  You don't have permission to access the admin panel.
                </p>
                <Button asChild>
                  <Link href="/">Return to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <div className="py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Admin Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="flex flex-col gap-1 sticky top-8">
              <div className="mb-4">
                <h2 className="text-xl font-bold">Admin Panel</h2>
                <p className="text-sm text-muted-foreground">
                  {session?.user?.role === "ADMIN" ? "Administrator" : "Moderator"} Access
                </p>
              </div>
              
              <nav className="flex flex-col gap-1">
                {filteredNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  
                  return (
                    <Button
                      key={item.href}
                      variant={isActive ? "default" : "ghost"}
                      className={`justify-start ${isActive ? "" : "hover:bg-muted"}`}
                      asChild
                    >
                      <Link href={item.href}>
                        {item.icon}
                        <span className="ml-2">{item.title}</span>
                        {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                      </Link>
                    </Button>
                  );
                })}
              </nav>
              
              <div className="mt-auto pt-8">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/">
                    <LogOut className="h-4 w-4 mr-2" />
                    Exit Admin Panel
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </Container>
  );
}
