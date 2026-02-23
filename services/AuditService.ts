import AuditLog, { IAuditLog } from '@/models/AuditLog';
import connectToDatabase from '@/lib/db';
import { sanitizeObject } from '@/lib/sanitize';

export class AuditService {
    static async logAction(
        userId: string | undefined,
        action: string,
        resource: string,
        resourceId: string = "",
        details: any = {},
        status: 'success' | 'failure' | 'warning' = 'success'
    ) {
        try {
            await connectToDatabase();
            await AuditLog.create({
                userId,
                action,
                resource,
                resourceId,
                details,
                status,
                timestamp: new Date()
            });
        } catch (error) {
            console.error("Failed to write audit log:", error);
            // Non-blocking: audit failure shouldn't crash the app flow
        }
    }

    static async getLogs(filters: any = {}, page: number = 1, limit: number = 20) {
        await connectToDatabase();
        const query: any = {};

        if (filters.action) {
            query.action = { $regex: filters.action, $options: 'i' };
        }
        if (filters.resource) {
            query.resource = filters.resource;
        }
        if (filters.status) {
            query.status = filters.status;
        }
        if (filters.userId) {
            query.userId = filters.userId;
        }
        if (filters.startDate && filters.endDate) {
            query.timestamp = {
                $gte: new Date(filters.startDate),
                $lte: new Date(filters.endDate)
            };
        }

        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name email'),
            AuditLog.countDocuments(query)
        ]);

        return {
            logs: logs.map(log => {
                const obj = log.toObject();
                return sanitizeObject({
                    ...obj,
                    _id: obj._id.toString(),
                    userId: obj.userId ? (obj.userId as any)._id?.toString() : undefined,
                    userName: (obj.userId as any)?.name || 'System',
                    userEmail: (obj.userId as any)?.email
                });
            }),
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }

    static async getComplianceStats() {
        await connectToDatabase();
        // Mock checks for now or simple aggregations
        // Example: Check for unauthorized access attempts (status: failure)
        const recentFailures = await AuditLog.countDocuments({
            status: 'failure',
            timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        // Example: Expired Contracts (mock for now, ideally checks Contract model)
        const expiredDocuments = 0;

        return {
            securityAlerts: recentFailures,
            expiredDocuments,
            complianceScore: 100 - (recentFailures * 5) // Mock score calculation
        };
    }
}
