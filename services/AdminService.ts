import connectToDatabase from '@/lib/db';
import SystemLog from '@/models/SystemLog';
import GlobalSettings from '@/models/GlobalSettings';
import User from '@/models/User';
import Role from '@/models/Role';
import AccessRequest from '@/models/AccessRequest';
import { ROLE_TEMPLATES } from '@/lib/permissions';

const SOD_RULES = [
    {
        id: 'SOD-001',
        name: 'Maker-Checker Violation (HR)',
        description: 'User can both Create and Approve Leave Requests.',
        conflictingPermissions: ['hrm:leaves:manage', 'hrm:leaves:approve'],
        riskLevel: 'High'
    },
    {
        id: 'SOD-002',
        name: 'Payroll Self-Approval',
        description: 'User can Process Payroll and Approve payouts.',
        conflictingPermissions: ['hrm:payroll:process', 'hrm:payroll:approve'],
        riskLevel: 'High'
    },
    {
        id: 'SOD-003',
        name: 'User Admin Abuse',
        description: 'User can View Users and Delete Users without audit override.',
        conflictingPermissions: ['users:view', 'users:delete'],
        riskLevel: 'Medium'
    }
];

export class AdminService {
    /**
     * Get Admin Dashboard Stats
     */
    async getDashboardStats() {
        await connectToDatabase();

        const [usersCount, logsCount] = await Promise.all([
            User.countDocuments({ status: 'Active' }),
            SystemLog.countDocuments({ status: 'Error' }) // "Security Alerts" simplified
        ]);

        return {
            activeUsers: usersCount,
            securityAlerts: logsCount,
            // Mocking system health/server load as they require OS access
            systemHealth: "98.9%",
            serverLoad: "34%"
        };
    }

    /**
     * Get Recent Logs
     */
    async getRecentLogs(limit = 5) {
        await connectToDatabase();
        const logs = await SystemLog.find({})
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // Mock if empty for demo
        if (logs.length === 0) {
            return [
                { action: "System Backup", details: "Daily backup completed", user: "System", time: "2 hours ago", status: "Success" as const },
                { action: "User Login", details: "Admin login from new IP", user: "Admin", time: "4 hours ago", status: "Info" as const }
            ];
        }

        return JSON.parse(JSON.stringify(logs)).map((log: any) => ({
            id: log._id.toString(),
            event: log.action,
            time: new Date(log.createdAt).toLocaleTimeString(), // Simple format
            status: log.status,
            user: log.user
        }));
    }

    /**
     * Get Global Settings
     */
    async getSettings() {
        await connectToDatabase();
        let settings = await GlobalSettings.findOne();
        if (!settings) {
            settings = await GlobalSettings.create({});
        }
        return JSON.parse(JSON.stringify(settings));
    }

    /**
     * Update Global Settings
     */
    async updateSettings(data: any) {
        await connectToDatabase();
        const settings = await GlobalSettings.findOneAndUpdate({}, data, { new: true, upsert: true });
        return JSON.parse(JSON.stringify(settings));
    }

    /**
     * Access Risk Analysis (ARA)
     */
    async analyzeAccessRisks() {
        await connectToDatabase();

        // Fetch all roles from DB
        const roles = await Role.find({}).lean();

        // Also consider predefined templates if they aren't in DB yet (for demo completeness)
        const templateRoles = Object.entries(ROLE_TEMPLATES).map(([key, tpl]) => ({
            _id: key,
            name: tpl.label,
            permissions: tpl.permissions
        }));

        // Merge DB roles and templates (DB takes precedence if same name/id)
        // For simplicity in this demo, we'll analyze both or just DB roles if seeded.
        // Let's analyze the DB roles primarily.
        const allRoles = [...roles]; // Extend if needed

        const riskReport = allRoles.map((role: any) => {
            const violations: string[] = [];

            SOD_RULES.forEach(rule => {
                const hasAllPermissions = rule.conflictingPermissions.every(p =>
                    role.permissions.includes(p) || role.permissions.includes('*') || role.permissions.includes('all')
                );

                if (hasAllPermissions) {
                    violations.push(rule.id);
                }
            });

            return {
                id: role._id.toString(),
                name: role.name,
                permissions: role.permissions,
                violations
            };
        });

        return riskReport;
    }

    /**
     * Security: Get Access Requests
     */
    async getAccessRequests() {
        await connectToDatabase();
        const requests = await AccessRequest.find({ status: 'Pending' })
            .populate('userId', 'name email')
            .sort({ timestamp: -1 })
            .lean();

        return JSON.parse(JSON.stringify(requests)).map((req: any) => ({
            id: req._id,
            user: req.userId?.name || 'Unknown',
            email: req.userId?.email || 'Unknown',
            ip: req.ipAddress,
            location: req.location || 'Unknown',
            time: new Date(req.timestamp).toLocaleString(),
            status: req.status
        }));
    }

    /**
     * Security: Update Request Status
     */
    async updateAccessRequestStatus(requestId: string, status: 'Approved' | 'Rejected') {
        await connectToDatabase();
        const request = await AccessRequest.findByIdAndUpdate(requestId, { status }, { new: true });

        if (status === 'Approved' && request) {
            // Update User Allowed IP
            await User.findByIdAndUpdate(request.userId, {
                allowedIP: request.ipAddress,
                ipRestrictionEnabled: true // Ensure it's enabled if we approved specific IP
            });
        }

        return JSON.parse(JSON.stringify(request));
    }

    /**
     * Security: Get Admin Users
     */
    async getAdminUsers() {
        await connectToDatabase();
        const admins = await User.find({
            role: { $in: ['admin', 'super-admin', 'manager'] }
        }).lean();

        return JSON.parse(JSON.stringify(admins)).map((user: any) => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            ipRestriction: user.ipRestrictionEnabled,
            allowedIp: user.allowedIP || '',
            status: user.ipRestrictionLiftedUntil && new Date(user.ipRestrictionLiftedUntil) > new Date()
                ? `Released until ${new Date(user.ipRestrictionLiftedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : (user.ipRestrictionEnabled ? 'Protected' : 'Unrestricted')
        }));
    }

    /**
     * Security: Toggle IP Restriction
     */
    async toggleIpRestriction(userId: string) {
        await connectToDatabase();
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        user.ipRestrictionEnabled = !user.ipRestrictionEnabled;
        await user.save();

        return { success: true, enabled: user.ipRestrictionEnabled };
    }

    /**
     * Security: Release IP Restriction Temporarily
     */
    async releaseIpRestriction(userId: string, hours: number) {
        await connectToDatabase();
        const releaseUntil = new Date();
        releaseUntil.setHours(releaseUntil.getHours() + hours);

        await User.findByIdAndUpdate(userId, { ipRestrictionLiftedUntil: releaseUntil });

        return { success: true, releaseUntil };
    }

    /**
     * Create Log Entry
     */
    async logAction(action: string, details: string, user: string, status: 'Success' | 'Info' | 'Warning' | 'Error' = 'Info') {
        await connectToDatabase();
        await SystemLog.create({
            action,
            details,
            user,
            status
        });
    }
}

export const adminService = new AdminService();
