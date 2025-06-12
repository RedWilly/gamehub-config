"use client";

import { useState, useEffect, useCallback } from 'react';
import debounce from 'debounce';
import { format } from 'date-fns';
import { ArrowUpDown, MoreHorizontal, Copy, User as UserIcon, ShieldAlert } from 'lucide-react';

import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Role } from '@prisma/client'; // Assuming Role enum is available from Prisma client

/**
 * Represents a user object fetched from the API.
 */
interface User {
  id: string;
  username: string | null;
  email: string | null;
  role: Role;
  createdAt: string; // ISO date string
  suspendedUntil: string | null; // ISO date string or null
}

/**
 * Structure of the API response for fetching users.
 */
interface ApiResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * UserTable component for displaying and managing users.
 */
export function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');

  const [sortColumn, setSortColumn] = useState<keyof User | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Debounce search term changes
  const debouncedSetSearchTerm = useCallback(
    debounce((term: string) => {
      setDebouncedSearchTerm(term);
      setCurrentPage(1); // Reset to first page on new search
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSetSearchTerm(searchTerm);
  }, [searchTerm, debouncedSetSearchTerm]);

  // Fetch users from the API
  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      if (debouncedSearchTerm) {
        params.append('query', debouncedSearchTerm);
      }
      // Note: Backend sorting is not yet implemented in this example for the API call
      // If backend sorting is added, pass sortColumn and sortDirection here.

      try {
        const response = await fetch(`/api/admin/users?${params.toString()}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch users');
        }
        const result: ApiResponse = await response.json();
        setUsers(result.data);
        setTotalPages(result.meta.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setUsers([]);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [currentPage, itemsPerPage, debouncedSearchTerm /*, sortColumn, sortDirection */]);

  /**
   * Handles sorting when a column header is clicked.
   * @param column - The key of the user property to sort by.
   */
  const handleSort = (column: keyof User) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Client-side sorting logic
  const sortedUsers = [...users].sort((a, b) => {
    if (!sortColumn) return 0;

    const valA = a[sortColumn];
    const valB = b[sortColumn];

    if (valA === null || valA === undefined) return sortDirection === 'asc' ? 1 : -1;
    if (valB === null || valB === undefined) return sortDirection === 'asc' ? -1 : 1;

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    // Add more type handling if needed for other sortable columns (e.g., dates, numbers)
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  /**
   * Determines the status of the user.
   * @param user - The user object.
   * @returns 'Active' or 'Suspended'.
   */
  const getUserStatus = (user: User): { text: string; variant: 'default' | 'destructive' | 'secondary' } => {
    if (user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
      return { text: 'Suspended', variant: 'destructive' };
    }
    return { text: 'Active', variant: 'default' };
  };

  if (error) {
    return <div className="text-red-500 p-4">Error loading users: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter by username or email..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('username')}>
                  Username
                  {sortColumn === 'username' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('email')}>
                  Email
                  {sortColumn === 'email' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </Button>
              </TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('createdAt')}>
                  Joined
                  {sortColumn === 'createdAt' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : sortedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              sortedUsers.map((user) => {
                const status = getUserStatus(user);
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username || '-'}</TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === Role.ADMIN ? 'destructive' : user.role === Role.MODERATOR ? 'secondary' : 'outline'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.text}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(user.createdAt), 'PPpp')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy User ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => alert(`Viewing profile for ${user.username || user.id}`)}>
                            <UserIcon className="mr-2 h-4 w-4" />
                            View Profile (TBD)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => alert(`Suspending user ${user.username || user.id}`)}>
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            Suspend User (TBD)
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */} 
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage <= 1 || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
