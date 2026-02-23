"use server";

import { adminService } from "@/services/AdminService";
import { revalidatePath } from "next/cache";

export const getAdminDashboardData = async () => {
    try {
        const stats = await adminService.getDashboardStats();
        const logs = await adminService.getRecentLogs();
        return { success: true, data: { stats, logs } };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const getGlobalSettings = async () => {
    try {
        const settings = await adminService.getSettings();
        return { success: true, data: settings };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const updateGlobalSettings = async (data: any) => {
    try {
        await adminService.updateSettings(data);
        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};


// ARA Actions
export const analyzeRisks = async () => {
    try {
        const report = await adminService.analyzeAccessRisks();
        return { success: true, data: report };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

// Security Actions
export const getSecurityData = async () => {
    try {
        const [admins, requests] = await Promise.all([
            adminService.getAdminUsers(),
            adminService.getAccessRequests()
        ]);
        return { success: true, data: { admins, requests } };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const toggleAdminIpRestriction = async (userId: string) => {
    try {
        await adminService.toggleIpRestriction(userId);
        revalidatePath("/admin/security");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const releaseAdminIp = async (userId: string, hours: number) => {
    try {
        await adminService.releaseIpRestriction(userId, hours);
        revalidatePath("/admin/security");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const updateRequestStatus = async (requestId: string, status: 'Approved' | 'Rejected') => {
    try {
        await adminService.updateAccessRequestStatus(requestId, status);
        revalidatePath("/admin/security");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};
