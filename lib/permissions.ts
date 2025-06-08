import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

/**
 * Define access control permissions for the GameHub platform
 * This creates role-based permissions for different resources
 */
export const statement = {
    ...defaultStatements,
    // Core content permissions
    config: ["create", "read", "update", "delete", "hide", "feature", "revert"],
    game: ["create", "read", "update", "delete"],
    comment: ["create", "read", "update", "delete", "hide"],
    
    // Interaction permissions
    vote: ["create", "read", "delete"], // For config and comment voting
    report: ["create", "read", "review", "resolve", "dismiss"],
    
    // User management permissions
    user: ["read", "suspend", "ban", "promote", "demote"],
    
    // Version control permissions
    version: ["create", "read", "revert", "delete"],
    
    // Administrative permissions
    role: ["assign", "revoke", "view"],
    moderation: ["view_panel", "manage_reports", "bulk_actions"]
} as const;

// Create access control with defined permissions
export const ac = createAccessControl(statement);

// Define roles with specific permissions
export const adminRole = ac.newRole({
    // Inherit base admin capabilities
    ...adminAc.statements,
    
    // Content management - full permissions
    config: ["create", "read", "update", "delete", "hide", "feature", "revert"],
    game: ["create", "read", "update", "delete"],
    comment: ["create", "read", "update", "delete", "hide"],
    
    // User interactions
    vote: ["create", "read", "delete"],
    report: ["create", "read", "review", "resolve", "dismiss"],
    
    // User management - full permissions
    user: ["read", "suspend", "ban", "promote", "demote"],
    
    // Version control - full permissions
    version: ["create", "read", "revert", "delete"],
    
    // Administrative - full permissions
    role: ["assign", "revoke", "view"],
    moderation: ["view_panel", "manage_reports", "bulk_actions"]
});

export const moderatorRole = ac.newRole({
    // Content management - limited permissions (no permanent delete)
    config: ["create", "read", "update", "hide", "feature"],
    game: ["create","read", "update"], // Can create, read and update game info but not delete
    comment: ["create", "read", "update", "hide"], // Can't permanently delete
    
    // User interactions
    vote: ["create", "read", "delete"],
    report: ["create", "read", "review", "resolve", "dismiss"],
    
    // User management - limited (24hr suspend only, no ban)
    user: ["read", "suspend"], // Will need custom logic to enforce 24hr limit
    
    // Version control - limited
    version: ["create", "read", "revert"],
    
    // Moderation panel access
    moderation: ["view_panel", "manage_reports"]
});

export const userRole = ac.newRole({
    // Content management - basic permissions
    config: ["create", "read", "update"], // Can only update own configs
    game: ["create","read"],
    comment: ["create", "read", "update"], // Can only update own comments
    
    // User interactions - full voting rights
    vote: ["create", "read", "delete"], // Can vote and change votes
    report: ["create", "read"], // Can create reports and view own
    
    // User management - read only
    user: ["read"],
    
    // Version control - basic
    version: ["create", "read"] // Can create versions of own configs
});

// Public role for unauthenticated users - can only read non-hidden configs
export const publicRole = ac.newRole({
    // Only allow reading configs and games
    config: ["read"],
    game: ["read"]
});

// Additional helper functions for permission checking
export const canModerateUser = (userRole: string, targetRole: string): boolean => {
    // Admins can moderate anyone except other admins
    if (userRole === 'ADMIN') {
        return targetRole !== 'ADMIN';
    }
    
    // Moderators can only moderate regular users
    if (userRole === 'MODERATOR') {
        return targetRole === 'USER';
    }
    
    return false;
};

export const canSuspendUser = (userRole: string, suspensionHours: number): boolean => {
    if (userRole === 'ADMIN') {
        return true; // No time limit for admins
    }
    
    if (userRole === 'MODERATOR') {
        return suspensionHours <= 24; // 24hr limit for moderators
    }
    
    return false;
};

export const canEditContent = (userRole: string, contentOwnerId: string, currentUserId: string): boolean => {
    // Admins and moderators can edit any content
    if (userRole === 'ADMIN' || userRole === 'MODERATOR') {
        return true;
    }
    
    // Users can only edit their own content
    if (userRole === 'USER') {
        return contentOwnerId === currentUserId;
    }
    
    return false;
};

export const canDeleteContent = (userRole: string, contentOwnerId: string, currentUserId: string): boolean => {
    // Only admins can permanently delete content
    if (userRole === 'ADMIN') {
        return true;
    }
    
    // Users can delete their own content
    if (userRole === 'USER') {
        return contentOwnerId === currentUserId;
    }
    
    return false;
};

// New helper function to check if a config can be read by anyone
export const canReadConfig = (userRole: string | null, isHidden: boolean, contentOwnerId?: string, currentUserId?: string): boolean => {
    // If config is not hidden, anyone can read it (including public/unauthenticated users)
    if (!isHidden) {
        return true;
    }
    
    // Hidden configs require authentication and specific permissions
    if (!userRole || !currentUserId) {
        return false;
    }
    
    // Admins and moderators can view any hidden config
    if (userRole === 'ADMIN' || userRole === 'MODERATOR') {
        return true;
    }
    
    // Users can only view their own hidden configs
    if (userRole === 'USER' && contentOwnerId === currentUserId) {
        return true;
    }
    
    return false;
};

// Export permission constants for use in components
export const PERMISSIONS = {
    CONFIG: {
        CREATE: 'config:create',
        READ: 'config:read',
        UPDATE: 'config:update',
        DELETE: 'config:delete',
        HIDE: 'config:hide',
        FEATURE: 'config:feature',
        REVERT: 'config:revert'
    },
    USER: {
        READ: 'user:read',
        SUSPEND: 'user:suspend',
        BAN: 'user:ban',
        PROMOTE: 'user:promote',
        DEMOTE: 'user:demote'
    },
    VOTE: {
        CREATE: 'vote:create',
        READ: 'vote:read',
        DELETE: 'vote:delete'
    },
    REPORT: {
        CREATE: 'report:create',
        READ: 'report:read',
        REVIEW: 'report:review',
        RESOLVE: 'report:resolve',
        DISMISS: 'report:dismiss'
    },
    MODERATION: {
        VIEW_PANEL: 'moderation:view_panel',
        MANAGE_REPORTS: 'moderation:manage_reports',
        BULK_ACTIONS: 'moderation:bulk_actions'
    }
} as const;