import connectToDatabase from '@/lib/db';
import Payroll from '@/models/Payroll';
import User from '@/models/User';
import LeaveRequest from '@/models/LeaveRequest';
import Attendance from '@/models/Attendance';
import { sanitizeObject } from '@/lib/sanitize';

export class HRMService {
    async getDashboardStats() {
        await connectToDatabase();

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [totalEmployees, onLeaveToday, checkedInToday, newJoiners] = await Promise.all([
            User.countDocuments({ status: 'Active' }),
            LeaveRequest.countDocuments({
                status: 'Approved',
                startDate: { $lte: new Date() },
                endDate: { $gte: new Date() }
            }),
            Attendance.countDocuments({
                date: { $gte: today },
                $or: [{ status: 'Present' }, { status: 'Half-Day' }]
            }),
            User.countDocuments({
                createdAt: { $gte: startOfMonth }
            })
        ]);

        return {
            totalEmployees,
            onLeaveToday,
            checkedInToday,
            newJoiners
        };
    }

    async getPayslips(employeeId: string) {
        await connectToDatabase();
        // For demo, if no ID passed or mock user, return all or filtered.
        // In real app, strictly filter by session user ID.
        const query = employeeId ? { employeeId } : {};

        const slips = await Payroll.find(query).sort({ paymentDate: -1 });

        // Mock data if empty for demo purposes (Important for "wow" factor if db empty)
        if (slips.length === 0) {
            return []; // Return empty so UI handles it or we can seed
        }

        return JSON.parse(JSON.stringify(slips)).map((slip: any) => ({
            month: slip.month,
            status: slip.status,
            current: slip.month === 'October 2025', // Mock logic for current
            fileUrl: `/api/payslips/${slip._id}` // Placeholder URL
        }));
    }

    async getLeaveRequests(filter: any = {}) {
        await connectToDatabase();
        const requests = await LeaveRequest.find(filter).sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(requests));
    }

    async createLeaveRequest(data: any) {
        await connectToDatabase();
        if (!data.userId) throw new Error("User ID is required");

        // Ensure dates are date objects
        const sanitized = {
            ...sanitizeObject(data),
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate)
        };

        const leave = await LeaveRequest.create(sanitized);
        return JSON.parse(JSON.stringify(leave));
    }

    async updateLeaveStatus(id: string, status: string, approverId?: string) {
        await connectToDatabase();
        const update: any = { status };
        if (approverId) update.approverId = approverId;

        const leave = await LeaveRequest.findByIdAndUpdate(id, update, { new: true });
        return JSON.parse(JSON.stringify(leave));
    }

    async createPayslip(data: any) {
        await connectToDatabase();
        const sanitized = sanitizeObject(data);
        const slip = await Payroll.create(sanitized);
        return JSON.parse(JSON.stringify(slip));
    }

    async generatePayroll(month: string, year: number) {
        await connectToDatabase();

        // 1. Get all active users with salary structure
        const users = await User.find({ status: 'Active' });

        const payrolls = [];

        for (const user of users) {
            if (!user.salaryStructure) continue;

            const { basic = 0, hra = 0, allowances = 0, deductions } = user.salaryStructure;
            const gross = basic + hra + allowances;
            const totalFixedDeductions = (deductions?.pf || 0) + (deductions?.tax || 0) + (deductions?.other || 0);

            // 2. Calculate Attendance / LOP
            // Simplified: Assume 30 days. Count 'Absent' in the given month.
            const startDate = new Date(year, new Date(Date.parse(month + " 1, 2000")).getMonth(), 1);
            const endDate = new Date(year, new Date(Date.parse(month + " 1, 2000")).getMonth() + 1, 0);

            const absentDays = await Attendance.countDocuments({
                userId: user._id,
                date: { $gte: startDate, $lte: endDate },
                status: 'Absent'
            });

            const perDaySalary = gross / 30; // Standard 30 days
            const lop = Math.round(absentDays * perDaySalary);

            const totalDeductions = totalFixedDeductions + lop;
            const netPay = Math.max(0, gross - totalDeductions);

            // 3. Create or Update Payroll Record
            const payrollData = {
                employeeId: user._id,
                employeeName: user.name,
                month: `${month} ${year}`,
                status: 'Processed',
                salary: { basic, hra, allowances, gross },
                deductions: {
                    pf: deductions?.pf || 0,
                    tax: deductions?.tax || 0,
                    lop: lop,
                    other: deductions?.other || 0,
                    total: totalDeductions
                },
                netPay,
                paymentDate: new Date()
            };

            const payroll = await Payroll.findOneAndUpdate(
                { employeeId: user._id, month: `${month} ${year}` },
                payrollData,
                { upsert: true, new: true }
            );
            payrolls.push(payroll);
        }

        return JSON.parse(JSON.stringify(payrolls));
    }
}

export const hrmService = new HRMService();
