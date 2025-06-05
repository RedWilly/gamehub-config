import {
    createAuthClient
} from "better-auth/react";
import { usernameClient, adminClient, customSessionClient } from "better-auth/client/plugins";
import { useState, useEffect } from 'react';
import { ac, adminRole, moderatorRole, userRole } from "./permissions";
import type { auth } from "./auth"; // Import the auth instance as a type

/**
 * Create auth client with plugins for authentication and authorization
 */
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
    plugins: [ 
        usernameClient(),
        adminClient({
            ac,
            roles: {
                admin: adminRole,
                moderator: moderatorRole,
                user: userRole
            }
        }),
        customSessionClient<typeof auth>() // Add custom session client plugin to handle suspendedUntil field
    ] 
});

/**
 * Export authentication functions and hooks
 */
export const {
    signIn,
    signOut,
    signUp,
    useSession
} = authClient;

/**
 * Custom hook to check if user has specific permissions
 * @param permissions - Object containing resources and actions to check
 * @returns Boolean indicating if user has permission
 */
export const useHasPermission = (permissions: Record<string, string[]>) => {
    const { data: session } = useSession();
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    
    useEffect(() => {
        const checkPermission = async () => {
            if (!session) {
                setHasPermission(false);
                return;
            }
            
            try {
                const result = await authClient.admin.hasPermission({
                    permissions
                });
                // Convert the result to boolean explicitly
                setHasPermission(!!result);
            } catch (error) {
                console.error("Permission check error:", error);
                setHasPermission(false);
            }
        };
        
        checkPermission();
    }, [session, permissions]);
    
    return hasPermission;
};

/**
 * Custom hook to check if the current user is suspended
 * @returns Boolean indicating if user is suspended
 */
export const useIsSuspended = () => {
    const { data: session } = useSession();
    
    if (!session?.user) return false;
    
    // Check if suspendedUntil exists and is a future date
    const suspendedUntil = session.user.suspendedUntil 
        ? new Date(session.user.suspendedUntil) 
        : null;
        
    return suspendedUntil !== null && suspendedUntil > new Date();
};