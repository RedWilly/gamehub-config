//old permissions file
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

/**
 * Define access control permissions for the GameHub platform
 * This creates role-based permissions for different resources
 */
export const statement = {
    ...defaultStatements,
    // GameHub specific permissions
    config: ["create", "update", "delete", "hide", "feature"],
    game: ["create", "update", "delete"],
    comment: ["create", "delete", "hide"],
    report: ["review", "resolve", "dismiss"]
} as const;

// Create access control with defined permissions
export const ac = createAccessControl(statement);

// Define roles with specific permissions
export const adminRole = ac.newRole({
    ...adminAc.statements,
    config: ["create", "update", "delete", "hide", "feature"],
    game: ["create", "update", "delete"],
    comment: ["create", "delete", "hide"],
    report: ["review", "resolve", "dismiss"]
});

export const moderatorRole = ac.newRole({
    config: ["create", "update", "delete", "hide", "feature"],
    comment: ["create", "delete", "hide"],
    report: ["review", "resolve", "dismiss"]
});

export const userRole = ac.newRole({
    config: ["create", "update"],
    comment: ["create", "delete", "hide"]
});
