"use server";

import { PurchaseService } from "@/services/PurchaseService";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schemas
const ItemSchema = z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    rate: z.number().min(0, "Rate must be positive"),
    amount: z.number()
});

const CreateOrderSchema = z.object({
    vendor: z.string().min(1, "Vendor is required"),
    date: z.string().transform(str => new Date(str)),
    items: z.array(ItemSchema).min(1, "At least one item is required"),
    totalValue: z.number(),
    status: z.enum(['Draft', 'Sent']),
    notes: z.string().optional(),
    deliveryDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
});

// Actions

export async function getDashboardStats() {
    try {
        const stats = await PurchaseService.getDashboardStats();
        return { success: true, data: stats };
    } catch (error) {
        console.error("Failed to fetch purchase dashboard stats:", error);
        return { success: false, error: "Failed to load stats" };
    }
}

export async function getOrders(filters: any = {}) {
    try {
        const orders = await PurchaseService.getOrders(filters);
        return { success: true, data: orders };
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return { success: false, error: "Failed to load orders" };
    }
}

export async function createOrder(formData: any) {
    try {
        const validated = CreateOrderSchema.parse(formData);
        await PurchaseService.createOrder(validated);
        revalidatePath('/purchase');
        revalidatePath('/purchase/orders');
        return { success: true };
    } catch (error) {
        console.error("Create Order Error:", error);
        return { success: false, error: "Failed to create order" };
    }
}

export async function getVendors() {
    try {
        const vendors = await PurchaseService.getVendors();
        return { success: true, data: vendors };
    } catch (error) {
        console.error("Failed to fetch vendors:", error);
        return { success: false, error: "Failed to load vendors" };
    }
}

export async function getVendorStats(vendorName: string) {
    try {
        const stats = await PurchaseService.getVendorStats(vendorName);
        return { success: true, data: stats };
    } catch (error) {
        return { success: false, error: "Failed to load vendor stats" };
    }
}
