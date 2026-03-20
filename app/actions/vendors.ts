"use server";

import connectToDatabase from "@/lib/db";
import Contact from "@/models/Contact";
import { revalidatePath } from "next/cache";

export async function getVendors() {
    await connectToDatabase();
    try {
        const vendors = await Contact.find({ type: 'Vendor' })
            .sort({ createdAt: -1 })
            .lean();
        return { success: true, data: JSON.parse(JSON.stringify(vendors)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createVendor(data: {
    name: string;
    category?: string;
    address?: string;
    phone?: string;
    gstin?: string;
    email?: string;
}) {
    await connectToDatabase();
    try {
        const vendor = await Contact.create({
            name: data.name,
            email: data.email || `vendor_${Date.now()}@placeholder.com`,
            phone: data.phone,
            address: data.address,
            gstin: data.gstin,
            category: data.category,
            type: 'Vendor',
            status: 'Active',
        });
        revalidatePath("/masters/vendors");
        revalidatePath("/contacts/vendors");
        return { success: true, data: JSON.parse(JSON.stringify(vendor)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteVendor(id: string) {
    await connectToDatabase();
    try {
        await Contact.findByIdAndDelete(id);
        revalidatePath("/masters/vendors");
        revalidatePath("/contacts/vendors");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
