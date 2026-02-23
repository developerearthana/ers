"use server";

import { z } from "zod";
import { createJSONAction } from "@/lib/safe-action";
import { userService } from "@/services/UserService";
import { hrmService } from "@/services/HRMService";
import { revalidatePath } from "next/cache";

// --- User Actions ---

export const getHRMDashboardStats = async () => {
    try {
        const data = await hrmService.getDashboardStats();
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const getUsers = async () => {
    try {
        const users = await userService.getAllUsers();
        return { success: true, data: users };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

const UpdateUserSchema = z.object({
    id: z.string(),
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    role: z.string().optional(),
    dept: z.string().optional(),
    status: z.string().optional(),
    customRole: z.string().optional(),
    customPermissions: z.array(z.string()).optional(),
    salaryStructure: z.object({
        basic: z.number().optional(),
        hra: z.number().optional(),
        allowances: z.number().optional(),
        deductions: z.object({
            pf: z.number().optional(),
            tax: z.number().optional(),
            other: z.number().optional(),
        }).optional()
    }).optional(),
});

export const updateUser = createJSONAction(UpdateUserSchema, async (data) => {
    try {
        const { id, ...updateData } = data;
        await userService.updateUser(id, updateData);
        revalidatePath("/hrm/employees");
        revalidatePath("/hrm/employees/[id]/salary"); // Revalidate salary page
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to update user" };
    }
});

export const toggleUserStatus = async (id: string, currentStatus: string) => {
    try {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        await userService.updateUser(id, { status: newStatus });
        revalidatePath("/admin/users");
        return { success: true, newStatus };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const resetUserPassword = async (id: string) => {
    try {
        // In a real app, this might generate a token or send an email.
        // For this requirements, we might just set a default or return success if the UI handles the input.
        // Wait, the plan said "Simple dialog with New Password input".
        // So we need an action that accepts the password.
        throw new Error("Use resetUserPasswordWithInput instead");
    } catch (error) {
        return { success: false, error: "Legacy method" };
    }
}

export const adminResetPassword = async (id: string, newPassword: string) => {
    try {
        await userService.updatePassword(id, newPassword);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

// --- Leave Actions ---

export const getLeaves = async () => {
    try {
        const data = await hrmService.getLeaveRequests();
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

const LeaveRequestSchema = z.object({
    userId: z.string(),
    userName: z.string(),
    type: z.enum(['Sick', 'Casual', 'Festival', 'Emergency', 'Other']),
    startDate: z.string(),
    endDate: z.string(),
    reason: z.string().min(1),
});

export const requestLeave = createJSONAction(LeaveRequestSchema, async (data) => {
    try {
        await hrmService.createLeaveRequest(data);
        revalidatePath("/hrm/leave");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to submit leave request" };
    }
});

export const approveLeave = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
        await hrmService.updateLeaveStatus(id, status);
        revalidatePath("/hrm/leave");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

// --- Payroll Actions ---

export const getPayslips = async (employeeId?: string) => {
    try {
        const data = await hrmService.getPayslips(employeeId || "");
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const generateMonthlyPayroll = async (month: string, year: number) => {
    try {
        await hrmService.generatePayroll(month, year);
        revalidatePath("/hrm/payroll");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};
