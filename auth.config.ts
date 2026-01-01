import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback_secret_development_only",
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id!;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role as string;
                (session.user as any).id = token.id as string;
            }
            return session;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
