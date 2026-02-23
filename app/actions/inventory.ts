"use server";

import { z } from "zod";
import { createJSONAction } from "@/lib/safe-action";
import { inventoryService } from "@/services/InventoryService";
import { revalidatePath } from "next/cache";

// Actions
export const getInventoryDashboard = async () => {
    try {
        const data = await inventoryService.getInventoryDashboardData();
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const getProducts = async (filters: any) => {
    try {
        const data = await inventoryService.getProducts(filters);
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

const ProductSchema = z.object({
    name: z.string().min(1),
    sku: z.string().min(1),
    category: z.string(),
    quantity: z.number().optional(),
    minLevel: z.number().optional(),
    price: z.number().optional(),
    description: z.string().optional(),
});

export const createProduct = createJSONAction(ProductSchema, async (data) => {
    try {
        await inventoryService.createProduct(data);
        revalidatePath("/inventory");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to create product" };
    }
});
