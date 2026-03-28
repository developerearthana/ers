"use server";

import { AuditService } from "@/services/AuditService";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getAuditLogs(filters: any = {}, page: number = 1) {
    try {
        const result = await AuditService.getLogs(filters, page);
        return { success: true, data: result };
    } catch (error) {
        console.error("Failed to fetch audit logs:", error);
        return { success: false, error: "Failed to load audit logs" };
    }
}

export async function getComplianceStats() {
    try {
        const stats = await AuditService.getComplianceStats();
        return { success: true, data: stats };
    } catch (error) {
        return { success: false, error: "Failed to load compliance stats" };
    }
}

// Utility action to manually log an event (e.g., from client side special interactions)
// Most logging should happen in server actions of other modules
export async function logClientEvent(action: string, resource: string, details: any) {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        await AuditService.logAction(userId, action, resource, undefined, details, 'success');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}
