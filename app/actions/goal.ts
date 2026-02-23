'use server';

import dbConnect from '@/lib/db';
import Goal, { IGoal } from '@/models/Goal';
import { revalidatePath } from 'next/cache';

export async function createGoal(data: Partial<IGoal>) {
    try {
        await dbConnect();
        const goal = await Goal.create(data);
        revalidatePath('/goals');
        revalidatePath('/goals/plan');
        return { success: true, data: JSON.parse(JSON.stringify(goal)) };
    } catch (error: any) {
        console.error("Failed to create goal:", error);
        return { success: false, error: error.message };
    }
}

export async function createGoals(goals: Partial<IGoal>[]) {
    try {
        await dbConnect();
        const createdGoals = await Goal.insertMany(goals);
        revalidatePath('/goals');
        revalidatePath('/goals/plan');
        return { success: true, count: createdGoals.length };
    } catch (error: any) {
        console.error("Failed to create goals:", error);
        return { success: false, error: error.message };
    }
}

export async function getGoals(filter: any = {}) {
    try {
        await dbConnect();
        const goals = await Goal.find(filter).sort({ createdAt: -1 }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(goals)) };
    } catch (error: any) {
        console.error("Failed to fetch goals:", error);
        return { success: false, error: error.message };
    }
}

export async function updateGoal(id: string, data: Partial<IGoal>) {
    try {
        await dbConnect();
        const goal = await Goal.findByIdAndUpdate(id, data, { new: true }).lean();
        revalidatePath('/goals');
        return { success: true, data: JSON.parse(JSON.stringify(goal)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getGoalsByAssignee(userId: string) {
    try {
        await dbConnect();
        // Determine logic for "Assigned to them"
        // Could be direct assignment OR team assignment OR subsidiary assignment
        // For now, let's keep it simple: direct or checking generic filters if implemented later
        const goals = await Goal.find({ assignedTo: userId }).sort({ createdAt: -1 }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(goals)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
