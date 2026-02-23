import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    providers: [],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/');
            /* Note: startsWith('/') matches everything, strictly we might want 
               to protect specific routes, but let's assume root is protected 
               except login/register. 
               Better logic: 
               - Login/Register are public.
               - Everything else is protected.
            */
            const isAuthPage = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');

            if (isAuthPage) {
                if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
                return true;
            }

            // Protect all other routes
            if (!isLoggedIn) {
                return false; // Redirect to login
            }

            return true;
        },
    },
} satisfies NextAuthConfig;
