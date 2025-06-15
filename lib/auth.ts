import {
    betterAuth
} from 'better-auth';
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username, admin, customSession } from "better-auth/plugins";
import { ac, adminRole, moderatorRole, userRole, publicRole } from "./permissions";
import { prisma } from "./prisma";

// Create and export auth instance
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        sendResetPassword: async ({ user, url, token }, request) => {
            /**
             * Sends a password reset email using Resend via sendEmail utility.
             * @param user - The user object requesting reset
             * @param url - The reset link containing the token
             * @param token - The reset token
             * @param request - The original request object
             */
            const { sendEmail } = await import('./email');
            await sendEmail({
                to: user.email,
                subject: 'Reset your password',
                text: `Click the link to reset your password: ${url}`,
            });
        },
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
                user: userRole,
                public: publicRole
            },
            defaultRole: "USER",
            adminRoles: ["ADMIN"],
            publicRole: "public"
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