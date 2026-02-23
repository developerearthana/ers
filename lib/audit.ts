import connectToDatabase from './db';
import AuditLog from '@/models/AuditLog';
import { headers } from 'next/headers';

interface AuditLogData {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    status: 'success' | 'failure' | 'warning';
    details?: Record<string, any>;
}

/**
 * Create an audit log entry
 * Automatically captures IP address and user agent from headers
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
    try {
        // Safe header access
        let ipAddress = 'unknown';
        let userAgent = 'unknown';
        try {
            const headersList = await headers();
            ipAddress = headersList.get('x-real-ip') || headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
            userAgent = headersList.get('user-agent') || 'unknown';
        } catch (hError) {
            // Headers might fail in some contexts (e.g. static generation or certain middleware flows)
            // console.warn('AuditLog: Failed to read headers', hError);
        }

        try {
            await connectToDatabase();
            await AuditLog.create({
                ...data,
                ipAddress,
                userAgent,
                timestamp: new Date(),
            });
        } catch (dbError) {
            console.error('AuditLog: DB Write Failed', dbError);
        }

    } catch (error) {
        // Absolute fail-safe
        console.error('AuditLog: Critical Failure', error);
    }
}

/**
 * Log authentication events
 */
export async function logAuthEvent(
    action: 'login' | 'logout' | 'login_failed' | 'ip_blocked',
    userId?: string,
    details?: Record<string, any>
): Promise<void> {
    await createAuditLog({
        userId,
        action: `auth.${action}`,
        resource: 'authentication',
        status: action.includes('failed') || action.includes('blocked') ? 'failure' : 'success',
        details,
    });
}

/**
 * Log data modification events
 */
export async function logDataChange(
    action: 'create' | 'update' | 'delete',
    resource: string,
    resourceId: string,
    userId?: string,
    details?: Record<string, any>
): Promise<void> {
    await createAuditLog({
        userId,
        action: `data.${action}`,
        resource,
        resourceId,
        status: 'success',
        details,
    });
}

/**
 * Log security events
 */
export async function logSecurityEvent(
    event: string,
    details?: Record<string, any>
): Promise<void> {
    await createAuditLog({
        action: `security.${event}`,
        resource: 'security',
        status: 'warning',
        details,
    });
}
