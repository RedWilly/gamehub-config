import {
    betterAuth
} from 'better-auth';
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username, admin, customSession } from "better-auth/plugins";
import { ac, adminRole, moderatorRole, userRole } from "./permissions";
import { prisma } from "./prisma";

// Create and export auth instance
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
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
            defaultRole: "USER",
            adminRoles: ["ADMIN"],
        }),
        customSession(async ({ user, session }) => {
            // Get the full user data including suspendedUntil and role field
            const fullUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: {
                    suspendedUntil: true,
                    role: true
                }
            });
            
            return {
                user: {
                    ...user,
                    suspendedUntil: fullUser?.suspendedUntil || null,
                    role: fullUser?.role
                },
                session
            };
        }),
    ],
});