import { format } from 'date-fns';
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

        const [activeUsers, onLeaveUsers, checkedInRecords, newJoinersList] = await Promise.all([
            User.find({ status: 'Active' }, 'name email role image dept'),
            LeaveRequest.find({
                status: 'Approved',
                startDate: { $lte: new Date() },
                endDate: { $gte: new Date() }
            }),
            Attendance.find({
                date: { $gte: today },
                $or: [{ status: 'Present' }, { status: 'Half-Day' }]
            }).populate('userId', 'name email role image dept'),
            User.find({
                createdAt: { $gte: startOfMonth }
            }, 'name email role image dept')
        ]);

        const attendanceMap = new Map();
        checkedInRecords.forEach((a: any) => { if (a.userId) attendanceMap.set(a.userId._id?.toString(), a) });

        const absenteesList = activeUsers.filter(user => !attendanceMap.has(user._id.toString()));
        const checkedInList = checkedInRecords.map((a: any) => a.userId).filter(Boolean);

        return JSON.parse(JSON.stringify({
            totalEmployees: activeUsers.length,
            onLeaveToday: onLeaveUsers.length,
            checkedInToday: checkedInList.length,
            newJoiners: newJoinersList.length,
            lists: {
                employees: activeUsers,
                absentees: absenteesList,
                checkedIn: checkedInList,
                newJoiners: newJoinersList
            }
        }));
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

    async updateLeaveStatus(id: string, status: string, approverId?: string, approverName?: string, approverRole?: string) {
        await connectToDatabase();
        const update: any = { status };
        if (approverId) update.approverId = approverId;
        if (approverName) update.approverName = approverName;
        if (approverRole) update.approverRole = approverRole;

        const leave = await LeaveRequest.findByIdAndUpdate(id, update, { new: true });
        return JSON.parse(JSON.stringify(leave));
    }

    async createPayslip(data: any) {
        await connectToDatabase();
        const sanitized = sanitizeObject(data);
        const slip = await Payroll.create(sanitized);
        return JSON.parse(JSON.stringify(slip));
    }

    async getAttendance(userId: string, month?: number, year?: number) {
        await connectToDatabase();
        const query: any = { userId };

        if (month !== undefined && year !== undefined) {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);
            query.date = { $gte: startDate, $lte: endDate };
        }

        const records = await Attendance.find(query).sort({ date: 1 });
        return JSON.parse(JSON.stringify(records));
    }

    async getAllAttendance(date?: Date) {
        await connectToDatabase();
        const targetDate = date || new Date();
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const records = await Attendance.find({
            date: { $gte: targetDate, $lt: nextDay }
        }).populate('userId', 'name email dept role image').sort({ punchIn: 1 });

        return JSON.parse(JSON.stringify(records));
    }

    async getAttendanceReport(month: number, year: number) {
        await connectToDatabase();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const records = await Attendance.find({
            date: { $gte: startDate, $lte: endDate }
        }).populate('userId', 'name email dept role image').sort({ date: -1, punchIn: 1 });

        return JSON.parse(JSON.stringify(records));
    }

    async getAbsentees(date?: Date) {
        await connectToDatabase();
        const targetDate = date || new Date();
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const activeUsers = await User.find({ status: 'Active' }, 'name email dept role image');
        const attendances = await Attendance.find({
            date: { $gte: targetDate, $lt: nextDay }
        });

        const attendanceMap = new Map();
        attendances.forEach(a => attendanceMap.set(a.userId.toString(), a));

        const absentees = activeUsers.filter(user => {
            const userId = user._id.toString();
            if (!attendanceMap.has(userId)) return true;
            const record = attendanceMap.get(userId);
            if (record.status === 'Absent') return true;
            return false;
        });

        return JSON.parse(JSON.stringify(absentees));
    }

    async getLiveUsers() {
        await connectToDatabase();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextDay = new Date(today);
        nextDay.setDate(nextDay.getDate() + 1);

        const records = await Attendance.find({
            date: { $gte: today, $lt: nextDay },
            punchIn: { $exists: true, $ne: null },
            punchOut: { $exists: false }
        }).populate('userId', 'name email dept role image');

        return JSON.parse(JSON.stringify(records));
    }

    async punchIn(userId: string, workMode: 'Office' | 'Remote' = 'Office') {
        await connectToDatabase();

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Check if already has an open session (punched in but not yet out)
        const activeRecord = await Attendance.findOne({
            userId,
            date: { $gte: today },
            punchIn: { $exists: true, $ne: null },
            $or: [{ punchOut: { $exists: false } }, { punchOut: null }]
        });

        if (activeRecord) throw new Error('Already punched in. Please punch out first.');

        // Use upsert to gracefully handle unique index on {userId, date}
        const record = await Attendance.findOneAndUpdate(
            { userId, date: today },
            {
                $set: {
                    punchIn: now,
                    status: workMode === 'Remote' ? 'WFH' : 'Present',
                    workMode,
                    punchOut: null,
                }
            },
            { upsert: true, new: true }
        );

        return JSON.parse(JSON.stringify(record));
    }

    async punchOut(userId: string) {
        await connectToDatabase();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find open punch-in session today
        const record = await Attendance.findOne({
            userId,
            date: { $gte: today },
            punchIn: { $exists: true, $ne: null },
            $or: [{ punchOut: { $exists: false } }, { punchOut: null }]
        });

        if (!record || !record.punchIn) throw new Error("You haven't punched in yet or already punched out.");

        const punchOutTime = new Date();
        const hoursWorked = Math.round(
            (punchOutTime.getTime() - new Date(record.punchIn).getTime()) / (1000 * 60 * 60) * 100
        ) / 100;

        record.punchOut = punchOutTime;
        record.hoursWorked = hoursWorked;
        await record.save();

        return JSON.parse(JSON.stringify(record));
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

    async generatePayrollForEmployee(employeeId: string, month: string, year: number) {
        await connectToDatabase();
        const user = await User.findById(employeeId);
        if (!user) throw new Error('Employee not found');
        if (!user.salaryStructure) throw new Error(`No salary structure configured for ${user.name}. Please set up salary first.`);

        const { basic = 0, hra = 0, allowances = 0, deductions } = user.salaryStructure;
        const gross = basic + hra + allowances;
        const totalFixedDeductions = (deductions?.pf || 0) + (deductions?.tax || 0) + (deductions?.other || 0);

        const monthIndex = new Date(Date.parse(month + ' 1, 2000')).getMonth();
        const startDate = new Date(year, monthIndex, 1);
        const endDate = new Date(year, monthIndex + 1, 0);

        const [absentDays, presentDays, totalHours] = await Promise.all([
            Attendance.countDocuments({ userId: user._id, date: { $gte: startDate, $lte: endDate }, status: 'Absent' }),
            Attendance.countDocuments({ userId: user._id, date: { $gte: startDate, $lte: endDate }, status: { $in: ['Present', 'WFH', 'Half-Day'] } }),
            Attendance.aggregate([
                { $match: { userId: user._id, date: { $gte: startDate, $lte: endDate } } },
                { $group: { _id: null, total: { $sum: '$hoursWorked' } } }
            ])
        ]);

        const workedHours = totalHours[0]?.total || 0;
        const perDaySalary = gross / 30;
        const lop = Math.round(absentDays * perDaySalary);
        const totalDeductions = totalFixedDeductions + lop;
        const netPay = Math.max(0, gross - totalDeductions);

        const payrollData = {
            employeeId: user._id,
            employeeName: user.name,
            month: `${month} ${year}`,
            status: 'Pending',
            salary: { basic, hra, allowances, gross },
            deductions: { pf: deductions?.pf || 0, tax: deductions?.tax || 0, lop, other: deductions?.other || 0, total: totalDeductions },
            netPay,
            paymentDate: new Date(),
            attendanceSummary: { presentDays, absentDays, workedHours: Math.round(workedHours * 10) / 10 }
        };

        const payroll = await Payroll.findOneAndUpdate(
            { employeeId: user._id, month: `${month} ${year}` },
            payrollData,
            { upsert: true, new: true }
        );
        return JSON.parse(JSON.stringify(payroll));
    }

    async getAllPayrollForMonth(month: string, year: number) {
        await connectToDatabase();
        const payrolls = await Payroll.find({ month: `${month} ${year}` }).sort({ employeeName: 1 });
        return JSON.parse(JSON.stringify(payrolls));
    }

    async markPayrollPaid(payrollId: string) {
        await connectToDatabase();
        const payroll = await Payroll.findByIdAndUpdate(payrollId, { status: 'Paid', paymentDate: new Date() }, { new: true });
        return JSON.parse(JSON.stringify(payroll));
    }

    async getAttendancePulse() {
        await connectToDatabase();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        // Assume standard login time is 09:30 AM
        // We'll count records where punchIn exists and is after 09:30 AM on that day
        const records = await Attendance.find({
            date: { $gte: thirtyDaysAgo },
            punchIn: { $exists: true }
        });

        const pulse: Record<string, number> = {};

        records.forEach(rec => {
            const dateKey = format(new Date(rec.date), 'yyyy-MM-dd');
            const punchInTime = new Date(rec.punchIn!);
            const standardTime = new Date(rec.punchIn!);
            standardTime.setHours(9, 30, 0, 0);

            if (punchInTime > standardTime) {
                pulse[dateKey] = (pulse[dateKey] || 0) + 1;
            } else {
                if (!pulse[dateKey]) pulse[dateKey] = 0;
            }
        });

        return pulse;
    }
}

export const hrmService = new HRMService();
