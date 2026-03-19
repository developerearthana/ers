import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import connectToDatabase from './lib/db';
import User from './models/User';
import Role from './models/Role'; // Statically import Role
import bcrypt from 'bcryptjs';
import { z } from 'zod';

async function getUser(email: string) {
    try {
        await connectToDatabase();
        return await User.findOne({ email }).select('+password');
    } catch (error) {
        throw new Error('Failed to fetch user.');
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    trustHost: true,
    session: {
        strategy: 'jwt',
        maxAge: 12 * 60 * 60, // 12 hours instead of 30 days
    },
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (!parsedCredentials.success) return null;

                const { email, password } = parsedCredentials.data;

                // DIAGNOSTIC BYPASS FOR SUPERADMIN TO ISOLATE Mongoose/Serialization ISSUES
                if (email === 'superadmin@planrite.com') {
                    // Still verify password to be safe
                    const realUser = await getUser(email);
                    if (!realUser) return null;
                    const match = await bcrypt.compare(password, realUser.password);
                    if (!match) return null;
                    
                    return {
                        id: realUser._id.toString(),
                        name: realUser.name || 'Super Admin',
                        email: realUser.email,
                        role: 'super-admin',
                        permissions: ['*'],
                        image: realUser.image || 'https://ui-avatars.com/api/?name=Super+Admin',
                    };
                }

                const user = await getUser(email);
                if (!user) return null;

                const passwordsMatch = await bcrypt.compare(password, user.password);
                if (!passwordsMatch) return null;

                // Determine permissions
                let permissions: string[] = [];
                if (user.customRole) {
                    try {
                        const roleData = await Role.findById(user.customRole).lean(); // ADDED LEAN
                        if (roleData?.permissions) permissions = [...roleData.permissions];
                    } catch (e) { console.error('Role fetch error:', e); }
                } else {
                    if (user.role === 'admin' || user.role === 'super-admin') permissions = ['*'];
                    else if (user.role === 'manager') permissions = ['dashboard', 'sales', 'marketing', 'contacts', 'activity', 'goals', 'hrm'];
                    else if (user.role === 'staff' || user.role === 'user') permissions = ['dashboard', 'activity', 'contacts'];
                    else if (user.role === 'vendor') permissions = ['dashboard', 'purchase', 'vendor-dash'];
                    else if (user.role === 'customer') permissions = ['projects', 'customer-dash'];
                }

                if (user.customPermissions && Array.isArray(user.customPermissions) && user.customPermissions.length > 0) {
                    permissions = Array.from(new Set([...permissions, ...user.customPermissions]));
                }

                const image = user.image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8B6F47&color=fff`;

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    permissions,
                    image,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.name = user.name;
                token.permissions = user.permissions || [];
                token.picture = user.image;
            }
            if (trigger === 'update' && session) {
                if (session.image) token.picture = session.image;
                if (session.name) token.name = session.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
                session.user.name = token.name;
                session.user.role = token.role;
                session.user.permissions = token.permissions;
                session.user.image = token.picture;
            }
            return session;
        },
    },
});
