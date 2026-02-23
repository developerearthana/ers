"use server";

import { z } from "zod";
import { createJSONAction } from "@/lib/safe-action";
import { projectService } from "@/services/ProjectService";
import { revalidatePath } from "next/cache";

// Validation
const ProjectSchema = z.object({
    name: z.string().min(1, "Name is required"),
    client: z.string().min(1, "Client is required"),
    description: z.string().optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    template: z.string().optional(),
});

// Actions
export const getProjects = async (filters?: { status?: string, search?: string }) => {
    try {
        const projects = await projectService.getProjects(filters);
        return { success: true, data: projects };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const createProject = createJSONAction(ProjectSchema, async (data) => {
    try {
        const project = await projectService.createProject(data);
        revalidatePath("/projects/list");
        return { success: true, data: project };
    } catch (error: any) {
        return { error: error.message || "Failed to create project" };
    }
});
