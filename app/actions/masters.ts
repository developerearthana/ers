"use server";

import Master, { IMaster } from "@/models/Master";
import connectToDatabase from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Get all masters grouped by type or filtered by type
 */
export async function getMasters(type?: string) {
    await connectToDatabase();
    const query = type ? { type, isActive: true } : { isActive: true };
    const masters = await Master.find(query).sort({ order: 1, label: 1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(masters)) };
}

/**
 * Create a new master entry
 */
export async function createMaster(data: Partial<IMaster>) {
    await connectToDatabase();
    try {
        const master = await Master.create(data);
        revalidatePath("/settings/masters");
        return { success: true, data: JSON.parse(JSON.stringify(master)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Update a master entry
 */
export async function updateMaster(id: string, data: Partial<IMaster>) {
    await connectToDatabase();
    try {
        const master = await Master.findByIdAndUpdate(id, data, { new: true });
        revalidatePath("/settings/masters");
        return { success: true, data: JSON.parse(JSON.stringify(master)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Delete (soft delete) a master entry
 */
export async function deleteMaster(id: string) {
    await connectToDatabase();
    try {
        await Master.findByIdAndDelete(id); // Hard delete for now to keep it simple, or soft delete with isActive=false
        revalidatePath("/settings/masters");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Seed initial masters if they don't exist
 */
export async function seedMasters() {
    await connectToDatabase();

    const count = await Master.countDocuments();
    if (count > 0) return { success: true, message: "Masters already seeded" };

    const initialData = [
        // Contact Types
        { type: "ContactType", label: "Client", value: "Client", order: 1, color: "bg-blue-50 text-blue-700 border-blue-100" },
        { type: "ContactType", label: "Vendor", value: "Vendor", order: 2, color: "bg-purple-50 text-purple-700 border-purple-100" },
        { type: "ContactType", label: "Lead", value: "Lead", order: 3, color: "bg-orange-50 text-orange-700 border-orange-100" },
        { type: "ContactType", label: "Partner", value: "Partner", order: 4, color: "bg-green-50 text-green-700 border-green-100" },
        { type: "ContactType", label: "Consultant", value: "Consultant", order: 5, color: "bg-gray-50 text-gray-700 border-gray-100" },

        // Vendor Categories
        { type: "VendorCategory", label: "Material Supplier", value: "Material Supplier", order: 1 },
        { type: "VendorCategory", label: "Service Provider", value: "Service Provider", order: 2 },
        { type: "VendorCategory", label: "Contractor", value: "Contractor", order: 3 },
        { type: "VendorCategory", label: "Consultant", value: "Consultant", order: 4 },

        // Lead Status
        { type: "LeadStatus", label: "New", value: "New", order: 1, color: "bg-blue-50 text-blue-700 border-blue-100", isDefault: true },
        { type: "LeadStatus", label: "Contacted", value: "Contacted", order: 2, color: "bg-amber-50 text-amber-700 border-amber-100" },
        { type: "LeadStatus", label: "Qualified", value: "Qualified", order: 3, color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
        { type: "LeadStatus", label: "Lost", value: "Lost", order: 4, color: "bg-red-50 text-red-700 border-red-100" },
        { type: "LeadStatus", label: "Converted", value: "Converted", order: 5, color: "bg-green-50 text-green-700 border-green-100" },

        // Contact Status
        { type: "ContactStatus", label: "Active", value: "Active", order: 1, color: "bg-emerald-500", isDefault: true },
        { type: "ContactStatus", label: "Inactive", value: "Inactive", order: 2, color: "bg-gray-300" },
        { type: "ContactStatus", label: "New", value: "New", order: 3, color: "bg-blue-500" },
    ];

    await Master.insertMany(initialData);
    return { success: true, message: "Masters seeded successfully" };
}
