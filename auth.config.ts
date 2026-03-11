import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    providers: [],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isAuthPage = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');
            const isPublicAsset = nextUrl.pathname.includes('.') || nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|ico|webp)$/) || nextUrl.pathname.startsWith('/public/');

            if (isPublicAsset) return true;

            // Always allow the login / register pages — never auto-redirect away.
            // This ensures clicking the app URL always shows the login form first.
            if (isAuthPage) return true;

            // Protect every other route — unauthenticated users go to /login
            if (!isLoggedIn) return false;

            return true;
        },
    },
} satisfies NextAuthConfig;
