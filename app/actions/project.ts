"use server";

import { projectService } from "@/services/ProjectService";
import { revalidatePath } from "next/cache";

export const getProjects = async (filters: any) => {
    try {
        const data = await projectService.getProjects(filters);
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const getProjectStats = async () => {
    try {
        const data = await projectService.getDashboardStats();
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const createProject = async (data: any) => {
    try {
        const project = await projectService.createProject(data);
        revalidatePath('/projects');
        return { success: true, data: project };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const updateProject = async (id: string, data: any) => {
    try {
        const project = await projectService.updateProject(id, data);
        revalidatePath('/projects');
        return { success: true, data: project };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};
