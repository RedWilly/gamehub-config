import {
    createAuthClient
} from "better-auth/react";
import { usernameClient, adminClient } from "better-auth/client/plugins";
import { useState, useEffect } from 'react';
import { ac, adminRole, moderatorRole, userRole } from "./permissions";

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
        })
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