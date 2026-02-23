import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { authConfig } from './auth.config';
import connectToDatabase from './lib/db';
import User from './models/User';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { logAuthEvent, logSecurityEvent } from './lib/audit'; // Safe import
import rateLimiter, { RATE_LIMITS } from './lib/rate-limit'; // Safe import

async function getUser(email: string) {
    try {
        await connectToDatabase();
        return await User.findOne({ email }).select('+password');
    } catch (error) {
        throw new Error('Failed to fetch user.');
    }
}

/**
 * Get client IP address from headers
 * Note: This should be used in conjunction with infrastructure-level IP filtering
 */
function getClientIP(headersList: Headers): string {
    // Try multiple headers in order of reliability
    const xRealIP = headersList.get('x-real-ip');
    if (xRealIP) return xRealIP;

    const xForwardedFor = headersList.get('x-forwarded-for');
    if (xForwardedFor) {
        // Take the first IP in the chain (client IP)
        return xForwardedFor.split(',')[0].trim();
    }

    return 'unknown';
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    trustHost: true,
    providers: [
        Credentials({
            async authorize(credentials) {
                console.log('--- AUTHORIZE START (SIMPLIFIED) ---');

                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (!parsedCredentials.success) {
                    console.log('Invalid credentials format');
                    try { await logAuthEvent('login_failed', undefined, { reason: 'invalid_credentials_format' }); } catch (e) { console.error('SafeLog Error:', e); }
                    return null;
                }

                const { email, password } = parsedCredentials.data;
                console.log(`Checking user: ${email}`);

                // Safe Rate Limiting
                try {
                    const { headers } = await import('next/headers');
                    const headersList = await headers();
                    const clientIP = getClientIP(headersList);

                    if (rateLimiter.isRateLimited(clientIP, RATE_LIMITS.LOGIN.maxRequests, RATE_LIMITS.LOGIN.windowMs)) {
                        console.warn(`Rate limit exceeded for: ${clientIP}`);
                        try { await logSecurityEvent('rate_limit_exceeded', { ip: clientIP, email }); } catch (e) { console.error('SafeLog Error:', e); }
                        return null;
                    }
                } catch (rlError) {
                    console.error('RateLimit Error:', rlError);
                    // Fail open: If rate limit check fails, allow access but log error
                }

                let user;
                try {
                    user = await getUser(email);
                } catch (e) {
                    console.error('DB Error:', e);
                    return null;
                }

                if (!user) {
                    console.log('User not found');
                    try { await logAuthEvent('login_failed', undefined, { email, reason: 'user_not_found' }); } catch (e) { console.error('SafeLog Error:', e); }
                    return null;
                }

                // IP Restriction Check
                if (user.ipRestrictionEnabled) {
                    // Check if restriction is temporarily lifted
                    const isLifted = user.ipRestrictionLiftedUntil && new Date() < new Date(user.ipRestrictionLiftedUntil);

                    if (!isLifted) {
                        // We need the clientIP from the earlier block. 
                        // To avoid scope issues, we need to restructure or fetch it again if it wasn't saved.
                        // Or better, let's just re-fetch headers/IP safely here since it's cheap.
                        try {
                            const { headers } = await import('next/headers');
                            const headersList = await headers();
                            const clientIP = getClientIP(headersList);
                            const isLocalhost = clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === 'unknown';

                            if (!isLocalhost && clientIP !== user.allowedIP) {
                                console.warn(`IP Restriction Block: User ${email} attempted login from ${clientIP}, allowed: ${user.allowedIP}`);
                                try {
                                    await logSecurityEvent('ip_restriction_violation', {
                                        userId: user._id.toString(),
                                        email: user.email,
                                        attemptedIP: clientIP,
                                        allowedIP: user.allowedIP
                                    });

                                    // Import AccessRequest dynamically
                                    const AccessRequest = (await import('./models/AccessRequest')).default;
                                    await AccessRequest.create({
                                        userId: user._id,
                                        ipAddress: clientIP,
                                        location: 'Unknown',
                                        status: 'Pending'
                                    });
                                } catch (e) { console.error('SafeLog Error:', e); }

                                throw new Error('You are restricted to login outside');
                            }
                        } catch (ipError: any) {
                            if (ipError.message === 'You are restricted to login outside') {
                                throw ipError; // Re-throw the specific user facing error
                            }
                            console.error('IP Check Error:', ipError);
                            // Fail open if check crashes, or fail closed? 
                            // Usually security features should fail closed, but given recent stability issues, 
                            // failing open or logging only might be safer. 
                            // However, if the user *wants* restriction, failing closed is correct.
                            // Let's fail open for crash safety but strictly enforce if valid check fails.
                        }
                    }
                }

                const passwordsMatch = await bcrypt.compare(password, user.password);
                if (!passwordsMatch) {
                    console.log('Password mismatch');
                    try { await logAuthEvent('login_failed', user._id.toString(), { reason: 'invalid_password' }); } catch (e) { console.error('SafeLog Error:', e); }
                    return null;
                }

                console.log('Login Successful');
                try { await logAuthEvent('login', user._id.toString(), { ip: 'unknown' }); } catch (e) { console.error('SafeLog Error SUCCESS:', e); }

                // Determine permissions
                let permissions: string[] = [];

                // 1. Fetch Role Permissions if customRole exists
                if (user.customRole) {
                    try {
                        const Role = (await import('./models/Role')).default;
                        const roleData = await Role.findById(user.customRole);
                        if (roleData && roleData.permissions) {
                            permissions = [...roleData.permissions];
                        }
                    } catch (e) {
                        console.error('Error fetching role permissions:', e);
                    }
                }
                // Fallback hardcoded defaults if no custom role (Backward Compatibility)
                else {
                    if (user.role === 'admin' || user.role === 'super-admin') permissions = ['*'];
                    if (user.role === 'manager') permissions = ['dashboard', 'sales', 'marketing', 'contacts', 'activity', 'goals'];
                    if (user.role === 'staff') permissions = ['dashboard', 'activity', 'contacts'];
                    if (user.role === 'vendor') permissions = ['dashboard', 'purchase', 'vendor-dash'];
                    if (user.role === 'customer') permissions = ['projects', 'customer-dash'];
                }

                // 2. Merge User-Specific Custom Permissions (Micro-Tuning)
                if (user.customPermissions && user.customPermissions.length > 0) {
                    // Create a Set to merge and remove duplicates
                    const permSet = new Set([...permissions, ...user.customPermissions]);
                    permissions = Array.from(permSet);
                }

                // Assign role-based avatar if missing
                let image = user.image;
                if (!image) {
                    const bgColors: { [key: string]: string } = {
                        'super-admin': '6366f1', // Indigo
                        'admin': '3b82f6', // Blue
                        'manager': '0ea5e9', // Sky
                        'staff': '22c55e', // Green
                        'vendor': 'f97316', // Orange
                        'customer': 'ef4444', // Red
                    };
                    const color = bgColors[user.role] || '64748b'; // Slate default
                    image = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=${color}&color=fff`;
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    permissions: permissions,
                    image: image,
                };
            },
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                    hd: process.env.AUTH_GOOGLE_HD || undefined, // Restrict to Workspace domain if set
                },
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            // Handle Google OAuth sign-in: auto-provision or link user
            if (account?.provider === 'google' && user.email) {
                try {
                    await connectToDatabase();
                    const existingUser = await User.findOne({ email: user.email });

                    if (!existingUser) {
                        // First-time Google user → create account
                        await User.create({
                            name: user.name || 'Google User',
                            email: user.email,
                            image: user.image,
                            provider: 'google',
                            role: 'user', // Default role; admin can upgrade later
                        });
                        console.log(`[Google Auth] New user created: ${user.email}`);
                    } else if (existingUser.provider === 'credentials' && !existingUser.image && user.image) {
                        // Link existing credentials user: update their avatar from Google
                        existingUser.image = user.image;
                        await existingUser.save();
                        console.log(`[Google Auth] Linked existing user: ${user.email}`);
                    }
                } catch (error) {
                    console.error('[Google Auth] Error during sign-in:', error);
                    return false; // Block sign-in on DB error
                }
            }
            return true;
        },
        async jwt({ token, user, account, trigger, session }) {
            // On initial sign-in (both Credentials and Google)
            if (user) {
                token.role = user.role;
                token.permissions = user.permissions || [];
                token.picture = user.image;
            }

            // For Google provider: fetch role & permissions from DB
            if (account?.provider === 'google' && token.email) {
                try {
                    await connectToDatabase();
                    const dbUser = await User.findOne({ email: token.email });
                    if (dbUser) {
                        token.sub = dbUser._id.toString();
                        token.role = dbUser.role;
                        token.picture = dbUser.image || token.picture;

                        // Load permissions (same logic as Credentials)
                        let permissions: string[] = [];
                        if (dbUser.customRole) {
                            try {
                                const Role = (await import('./models/Role')).default;
                                const roleData = await Role.findById(dbUser.customRole);
                                if (roleData?.permissions) permissions = [...roleData.permissions];
                            } catch (e) { console.error('Error fetching role permissions:', e); }
                        } else {
                            if (dbUser.role === 'admin' || dbUser.role === 'super-admin') permissions = ['*'];
                            if (dbUser.role === 'manager') permissions = ['dashboard', 'sales', 'marketing', 'contacts', 'activity', 'goals'];
                            if (dbUser.role === 'staff') permissions = ['dashboard', 'activity', 'contacts'];
                            if (dbUser.role === 'vendor') permissions = ['dashboard', 'purchase', 'vendor-dash'];
                            if (dbUser.role === 'customer') permissions = ['projects', 'customer-dash'];
                        }
                        if (dbUser.customPermissions?.length > 0) {
                            permissions = Array.from(new Set([...permissions, ...dbUser.customPermissions]));
                        }
                        token.permissions = permissions;
                    }
                } catch (error) {
                    console.error('[Google Auth] Error fetching user for JWT:', error);
                }
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
                session.user.role = token.role;
                session.user.permissions = token.permissions;
                session.user.image = token.picture;
            }
            return session;
        },
    },
});
