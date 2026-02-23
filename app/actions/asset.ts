"use server";

import { z } from "zod";
import { createJSONAction } from "@/lib/safe-action";
import { assetService } from "@/services/AssetService";
import { revalidatePath } from "next/cache";

// Schemas
const CreateAssetSchema = z.object({
    name: z.string().min(1, "Name is required"),
    category: z.string().min(1, "Category is required"),
    modelNo: z.string().optional(),
    serialNo: z.string().optional(),
    purchaseDate: z.string().min(1, "Date is required"),
    purchasePrice: z.coerce.number().min(0),
    description: z.string().optional(),
    createdBy: z.string().optional(),
});

const AssignAssetSchema = z.object({
    assetId: z.string(),
    userId: z.string(),
    assignedBy: z.string(),
    notes: z.string().optional(),
});

const ReturnAssetSchema = z.object({
    assetId: z.string(),
    assignedBy: z.string(),
    condition: z.string(),
    notes: z.string().optional(),
});

// Actions
export const getAssets = async (filters: any = {}) => {
    try {
        const assets = await assetService.getAssets(filters);
        const stats = await assetService.getAssetStats();
        return { success: true, data: { assets, stats } };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const createAsset = createJSONAction(CreateAssetSchema, async (data) => {
    try {
        await assetService.createAsset(data);
        revalidatePath("/assets");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to create asset" };
    }
});

export const assignAsset = createJSONAction(AssignAssetSchema, async (data) => {
    try {
        await assetService.assignAsset(data.assetId, data.userId, data.assignedBy, data.notes);
        revalidatePath("/assets");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to assign asset" };
    }
});

export const returnAsset = createJSONAction(ReturnAssetSchema, async (data) => {
    try {
        await assetService.returnAsset(data.assetId, data.assignedBy, data.condition, data.notes);
        revalidatePath("/assets");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to return asset" };
    }
});
