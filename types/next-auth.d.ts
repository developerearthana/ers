import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    /**
     * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            role: string;
            permissions: string[];
            /**
             * By default, TypeScript expects the "email" field to be present.
             * And we extend the User interface to include the "role".
             */
        } & DefaultSession["user"]
    }

    interface User {
        role: string;
        permissions?: string[];
    }
}

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        role: string;
        permissions: string[];
    }
}
