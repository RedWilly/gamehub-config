"use client"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TowerControl } from 'lucide-react';

export function Header() {
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
              <Link href="/configs">Browse</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/submit">Submit</Link>
            </Button>
          </nav>
          <nav className="flex items-center space-x-2">
            <Button variant="ghost">Sign In</Button>
            <Button>Sign Up</Button>
          </nav>
        </div>
      </div>
    </header>
  );
}