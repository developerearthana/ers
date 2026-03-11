'use server';

import dbConnect from '@/lib/db';
import Goal, { IGoal } from '@/models/Goal';
import KPIEntry from '@/models/KPIEntry';
import { revalidatePath } from 'next/cache';

function extractNumericValue(value: string | number | null | undefined) {
    if (typeof value === 'number') return value;
    if (!value) return NaN;
    const normalized = String(value).replace(/,/g, '').replace(/[^0-9.-]+/g, '');
    return parseFloat(normalized);
}

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
        revalidatePath('/goals/board');
        return { success: true, count: createdGoals.length };
    } catch (error: any) {
        console.error("Failed to create goals:", error);
        return { success: false, error: error.message };
    }
}

export async function getGoals(filter: any = {}) {
    try {
        await dbConnect();
        const query: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(filter || {})) {
            if (value !== undefined && value !== null && value !== '' && value !== 'All') {
                query[key] = value;
            }
        }

        const goals = await Goal.find(query)
            .populate('templateId', 'name department frequency unit defaultTarget')
            .populate('kpiTemplates', 'name department frequency unit')
            .sort({ startDate: -1, createdAt: -1 })
            .lean();

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
        revalidatePath('/goals/plan');
        revalidatePath('/goals/board');
        return { success: true, data: JSON.parse(JSON.stringify(goal)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteGoal(id: string) {
    try {
        await dbConnect();
        await KPIEntry.updateMany({ goalId: id }, { $unset: { goalId: 1 } });
        await Goal.findByIdAndDelete(id);
        revalidatePath('/goals');
        revalidatePath('/goals/plan');
        revalidatePath('/goals/board');
        revalidatePath('/goals/kpi');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getGoalDashboardData(filter: any = {}) {
    try {
        await dbConnect();

        const goalQuery: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(filter || {})) {
            if (value !== undefined && value !== null && value !== '' && value !== 'All') {
                goalQuery[key] = value;
            }
        }

        const goals = await Goal.find(goalQuery).sort({ startDate: -1, createdAt: -1 }).lean();
        const goalIds = goals.map((goal) => goal._id).filter(Boolean);

        const entries = goalIds.length > 0
            ? await KPIEntry.find({ goalId: { $in: goalIds } }).sort({ date: -1 }).lean()
            : [];

        const entriesByGoal = entries.reduce((acc, entry) => {
            const key = String(entry.goalId);
            if (!acc[key]) acc[key] = [];
            acc[key].push(entry);
            return acc;
        }, {} as Record<string, any[]>);

        const enrichedGoals = goals.map((goal: any) => {
            const linkedEntries = entriesByGoal[String(goal._id)] || [];
            const numericActuals = linkedEntries
                .map((entry: any) => extractNumericValue(entry.actual))
                .filter((value: number) => !Number.isNaN(value));

            const currentValue = goal.currentValue
                || (numericActuals.length > 0
                    ? String(numericActuals.reduce((sum: number, value: number) => sum + value, 0))
                    : linkedEntries[0]?.actual
                        || '0');

            const targetValue = extractNumericValue(goal.targetValue);
            const actualValue = extractNumericValue(currentValue);
            const progress = goal.progress
                || (!Number.isNaN(targetValue) && targetValue > 0 && !Number.isNaN(actualValue)
                    ? Math.max(0, Math.round((actualValue / targetValue) * 100))
                    : 0);

            return {
                ...goal,
                currentValue,
                progress,
                linkedEntryCount: linkedEntries.length,
                latestEntry: linkedEntries[0] || null,
            };
        });

        const periods = Array.from(new Set(enrichedGoals.map((goal) => goal.fiscalPeriod).filter(Boolean))).sort();
        const subsidiaries = Array.from(new Set(enrichedGoals.map((goal) => goal.subsidiary).filter(Boolean))).sort();

        const onTrackCount = enrichedGoals.filter((goal) => goal.progress >= 70).length;
        const atRiskCount = enrichedGoals.filter((goal) => goal.progress > 0 && goal.progress < 50).length;
        const progressAvg = enrichedGoals.length > 0
            ? Math.round(enrichedGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / enrichedGoals.length)
            : 0;

        const recentEntries = await KPIEntry.find(
            Object.keys(goalQuery).length > 0
                ? {
                    ...(goalQuery.subsidiary ? { subsidiary: goalQuery.subsidiary } : {}),
                }
                : {}
        )
            .sort({ date: -1 })
            .limit(5)
            .lean();

        return {
            success: true,
            data: {
                goals: JSON.parse(JSON.stringify(enrichedGoals)),
                periods,
                subsidiaries,
                stats: {
                    totalGoals: enrichedGoals.length,
                    onTrackCount,
                    atRiskCount,
                    progressAvg,
                },
                recentEntries: JSON.parse(JSON.stringify(recentEntries)),
            },
        };
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
