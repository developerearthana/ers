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

            if (isAuthPage) {
                if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
                return true;
            }

            // Strictly protect all other routes
            if (!isLoggedIn) {
                // By returning false, NextAuth will automatically redirect to the signIn page
                return false;
            }

            return true;
        },
    },
} satisfies NextAuthConfig;
