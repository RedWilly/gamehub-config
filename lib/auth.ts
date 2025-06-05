import {
    betterAuth
} from 'better-auth';
import { PrismaClient } from "@prisma/client";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username, admin } from "better-auth/plugins";
import { ac, adminRole, moderatorRole, userRole } from "./permissions";

// Create database client
const db = new PrismaClient();

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