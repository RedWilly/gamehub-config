import {
    betterAuth
} from 'better-auth';
import { PrismaClient } from "@prisma/client";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins"


const db = new PrismaClient();

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
    ],
    /** if no database is provided, the user data will be stored in memory.
     * Make sure to provide a database to persist user data **/
});