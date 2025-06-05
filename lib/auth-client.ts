import {
    createAuthClient
} from "better-auth/react";
import { usernameClient, adminClient } from "better-auth/client/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { useState, useEffect } from 'react';

/**
 * Define access control permissions for the GameHub platform
 * This must match the server-side definitions in auth.ts
 */
const statement = {
    // Default admin permissions
    user: ["create", "list", "set-role", "ban", "impersonate", "delete"],
    session: ["list", "revoke", "delete"],
    
    // GameHub specific permissions
    config: ["create", "update", "delete", "hide", "feature"],
    game: ["create", "update", "delete"],
    comment: ["create", "delete", "hide"],
    report: ["review", "resolve", "dismiss"]
} as const;

// Create access control with defined permissions
const ac = createAccessControl(statement);

// Define roles with specific permissions
const adminRole = ac.newRole({
    user: ["create", "list", "set-role", "ban", "impersonate", "delete"],
    session: ["list", "revoke", "delete"],
    config: ["create", "update", "delete", "hide", "feature"],
    game: ["create", "update", "delete"],
    comment: ["delete", "hide"],
    report: ["review", "resolve", "dismiss"]
});

const moderatorRole = ac.newRole({
    config: ["hide", "feature"],
    comment: ["delete", "hide"],
    report: ["review", "resolve", "dismiss"]
});

const userRole = ac.newRole({
    config: ["create", "update"],
    comment: ["create"]
});

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