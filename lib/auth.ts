import {
    betterAuth
} from 'better-auth';
import { PrismaClient } from "@prisma/client";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username, admin } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";

// Create database client
const db = new PrismaClient();

/**
 * Define access control permissions for the GameHub platform
 * This creates role-based permissions for different resources
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
    comment: ["create", "delete", "hide"],
    report: ["review", "resolve", "dismiss"]
});

const moderatorRole = ac.newRole({
    config: ["create", "update", "hide", "feature"],
    comment: ["create", "delete", "hide"],
    report: ["review", "resolve", "dismiss"]
});

const userRole = ac.newRole({
    config: ["create", "update"],
    comment: ["create", "delete"]
});

// Create and export auth instance
export const auth = betterAuth({
    database: prismaAdapter(db, {
		provider: "postgresql",
	}),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!
        }
    },
    plugins: [
        username(),
        admin({
            ac,
            roles: {
                admin: adminRole,
                moderator: moderatorRole,
                user: userRole
            },
            defaultRole: "user",
            adminRoles: ["admin"],
        }),
    ],
});