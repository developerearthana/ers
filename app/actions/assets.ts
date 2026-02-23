"use server";

import { z } from "zod";
import { createJSONAction } from "@/lib/safe-action";
import { assetService } from "@/services/AssetService";
import { revalidatePath } from "next/cache";

export const getAssets = async () => {
    try {
        const data = await assetService.getAssets();
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

const CreateAssetSchema = z.object({
    name: z.string().min(1, "Name is required"),
    category: z.enum(['IT Equipment', 'Furniture', 'Appliance', 'Vehicle', 'Other']),
    assignedTo: z.string().optional(),
    value: z.number().min(0).optional(),
    status: z.enum(['In Use', 'Available', 'Maintenance', 'Retired']).optional(),
});

export const createAsset = createJSONAction(CreateAssetSchema, async (data) => {
    try {
        await assetService.createAsset(data);
        revalidatePath("/assets/list");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to create asset" };
    }
});
