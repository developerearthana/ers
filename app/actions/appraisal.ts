"use server";

import { z } from "zod";
import { createJSONAction } from "@/lib/safe-action";
import { appraisalService } from "@/services/AppraisalService";
import { revalidatePath } from "next/cache";

// Validation Schemas
const CreateAppraisalSchema = z.object({
    employeeId: z.string(),
    reviewerId: z.string(),
    period: z.string(),
    meetingDate: z.string().optional(),
});

const UpdateAppraisalSchema = z.object({
    id: z.string(),
    status: z.enum(['Scheduled', 'In Progress', 'Completed', 'Signed']).optional(),
    goalsScore: z.number().min(0).max(100).optional(),
    behavioralScore: z.number().min(0).max(100).optional(),
    finalScore: z.number().min(0).max(100).optional(),
    feedback: z.string().optional(),
    strengths: z.array(z.string()).optional(),
    improvements: z.array(z.string()).optional(),
});

// Actions
export const getAppraisals = async (filters: any = {}) => {
    try {
        const data = await appraisalService.getAppraisals(filters);
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const createAppraisal = createJSONAction(CreateAppraisalSchema, async (data) => {
    try {
        await appraisalService.createAppraisal(data);
        revalidatePath("/goals/review");
        revalidatePath("/goals");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to create appraisal" };
    }
});

export const updateAppraisal = createJSONAction(UpdateAppraisalSchema, async (data) => {
    try {
        const { id, ...updateData } = data;
        await appraisalService.updateAppraisal(id, updateData);
        revalidatePath("/goals/review");
        revalidatePath("/goals");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to update appraisal" };
    }
});
