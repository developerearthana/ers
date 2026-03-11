import connectToDatabase from '@/lib/db';
import KPIEntry from '@/models/KPIEntry';
import KPITemplate from '@/models/KPITemplate';
import Goal from '@/models/Goal';
import User from '@/models/User';
import { sanitizeObject } from '@/lib/sanitize';
import mongoose from 'mongoose';

export interface KPIEntryData {
    week: string;
    subsidiary: string;
    metric: string;
    assignee: string; // Name or ID
    team: string;
    target: string;
    actual: string;
    comment: string;
    date: string;
    goalId?: string;
}

function extractNumericValue(value: string | number | null | undefined) {
    if (typeof value === 'number') return value;
    if (!value) return NaN;
    const normalized = String(value).replace(/,/g, '').replace(/[^0-9.-]+/g, '');
    return parseFloat(normalized);
}

function deriveKPIStatus(targetValue: number, actualValue: number) {
    let varianceStr = '0%';
    let status: 'Exceeded' | 'Met' | 'Missed' = 'Met';

    if (!Number.isNaN(targetValue) && !Number.isNaN(actualValue) && targetValue !== 0) {
        const diff = actualValue - targetValue;
        const variancePercent = (diff / targetValue) * 100;
        const sign = variancePercent > 0 ? '+' : '';
        varianceStr = `${sign}${variancePercent.toFixed(1)}%`;

        if (variancePercent > 10) status = 'Exceeded';
        else if (variancePercent < -10) status = 'Missed';
    }

    return { varianceStr, status };
}

function deriveGoalStatus(progress: number): 'Not Started' | 'In Progress' | 'Completed' | 'At Risk' {
    if (progress >= 100) return 'Completed';
    if (progress <= 0) return 'Not Started';
    if (progress < 50) return 'At Risk';
    return 'In Progress';
}

export class KPIService {
    private async syncGoalProgress(goalId: string) {
        if (!mongoose.Types.ObjectId.isValid(goalId)) return;

        const goal = await Goal.findById(goalId);
        if (!goal) return;

        const entries = await KPIEntry.find({ goalId }).sort({ date: 1 }).lean();
        if (entries.length === 0) {
            await Goal.findByIdAndUpdate(goalId, {
                currentValue: '0',
                progress: 0,
                status: 'Not Started',
            });
            return;
        }

        const numericActuals = entries
            .map((entry) => extractNumericValue(entry.actual))
            .filter((value) => !Number.isNaN(value));

        const currentValue = numericActuals.length > 0
            ? String(numericActuals.reduce((sum, value) => sum + value, 0))
            : String(entries[entries.length - 1]?.actual || '0');

        const targetValue = extractNumericValue(goal.targetValue);
        const numericCurrent = extractNumericValue(currentValue);
        const progress = !Number.isNaN(targetValue) && targetValue > 0 && !Number.isNaN(numericCurrent)
            ? Math.max(0, Math.round((numericCurrent / targetValue) * 100))
            : goal.progress || 0;

        await Goal.findByIdAndUpdate(goalId, {
            currentValue,
            progress,
            status: deriveGoalStatus(progress),
        });
    }

    /**
     * Create a new KPI entry
     */
    async createKPIEntry(data: KPIEntryData) {
        await connectToDatabase();
        const sanitized = sanitizeObject(data);

        const targetVal = extractNumericValue(sanitized.target);
        const actualVal = extractNumericValue(sanitized.actual);
        const { varianceStr, status } = deriveKPIStatus(targetVal, actualVal);

        let userId = null;
        const user = mongoose.Types.ObjectId.isValid(sanitized.assignee)
            ? await User.findById(sanitized.assignee)
            : await User.findOne({ name: sanitized.assignee });
        if (user) {
            userId = user._id;
        }

        if (!userId) {
            throw new Error(`Assignee '${sanitized.assignee}' not found in database.`);
        }

        let templateId = null;
        if (sanitized.goalId && mongoose.Types.ObjectId.isValid(sanitized.goalId)) {
            const linkedGoal = await Goal.findById(sanitized.goalId).lean();
            if (linkedGoal?.templateId) {
                templateId = linkedGoal.templateId;
            } else if (linkedGoal?.kpiTemplates?.length) {
                templateId = linkedGoal.kpiTemplates[0];
            }
        }

        const entry = await KPIEntry.create({
            ...sanitized,
            assignee: userId,
            assigneeName: user.name,
            templateId,
            variance: varianceStr,
            status,
            date: new Date(sanitized.date),
        });

        if (sanitized.goalId) {
            await this.syncGoalProgress(sanitized.goalId);
        }

        return JSON.parse(JSON.stringify(entry));
    }

    /**
     * Get all KPI entries
     */
    /**
     * Get all KPI entries
     */
    async getKPIEntries(filters: Record<string, unknown> = {}) {
        await connectToDatabase();
        const query: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(filters)) {
            if (value !== undefined && value !== null && value !== '') {
                query[key] = value;
            }
        }

        const entries = await KPIEntry.find(query)
            .populate('assignee', 'name email image')
            .populate('goalId', 'title fiscalPeriod targetValue progress status')
            .populate('templateId', 'name department frequency unit')
            .sort({ date: -1 })
            .lean();

        return JSON.parse(JSON.stringify(entries)).map((e: any) => ({
            ...e,
            id: e._id.toString()
        }));
    }

    /**
     * Get KPI Templates
     */
    async getTemplates(filters: any = {}) {
        await connectToDatabase();
        const query: Record<string, unknown> = {};
        const { search, ...rest } = filters || {};

        for (const [key, value] of Object.entries(rest)) {
            if (value !== undefined && value !== null && value !== '' && value !== 'All') {
                query[key] = value;
            }
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { industry: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const templates = await KPITemplate.find(query).sort({ industry: 1, department: 1, name: 1 }).lean();
        return JSON.parse(JSON.stringify(templates)).map((t: any) => ({
            ...t,
            id: t._id.toString()
        }));
    }

    /**
     * Create KPI Template
     */
    async createTemplate(data: any) {
        await connectToDatabase();
        const template = await KPITemplate.create(data);
        return JSON.parse(JSON.stringify(template));
    }

    async updateTemplate(id: string, data: any) {
        await connectToDatabase();
        const template = await KPITemplate.findByIdAndUpdate(id, data, { new: true }).lean();
        return JSON.parse(JSON.stringify(template));
    }

    async deleteTemplate(id: string) {
        await connectToDatabase();
        const linkedGoals = await Goal.countDocuments({
            $or: [
                { templateId: id },
                { kpiTemplates: id },
            ],
        });

        if (linkedGoals > 0) {
            throw new Error('This template is linked to existing goals and cannot be deleted.');
        }

        await KPITemplate.findByIdAndDelete(id);
        return { success: true };
    }

    async updateKPIEntry(id: string, data: Partial<KPIEntryData>) {
        await connectToDatabase();
        const existing = await KPIEntry.findById(id).lean();
        if (!existing) {
            throw new Error('KPI entry not found');
        }

        const merged = {
            week: data.week ?? existing.week,
            subsidiary: data.subsidiary ?? existing.subsidiary,
            metric: data.metric ?? existing.metric,
            assignee: data.assignee ?? String(existing.assignee),
            team: data.team ?? existing.team,
            target: data.target ?? existing.target,
            actual: data.actual ?? existing.actual,
            comment: data.comment ?? existing.comment,
            date: data.date ?? new Date(existing.date).toISOString(),
            goalId: data.goalId ?? (existing.goalId ? String(existing.goalId) : undefined),
        };

        const targetVal = extractNumericValue(merged.target);
        const actualVal = extractNumericValue(merged.actual);
        const { varianceStr, status } = deriveKPIStatus(targetVal, actualVal);

        const user = mongoose.Types.ObjectId.isValid(merged.assignee)
            ? await User.findById(merged.assignee)
            : await User.findOne({ name: merged.assignee });
        if (!user) {
            throw new Error(`Assignee '${merged.assignee}' not found in database.`);
        }

        const updated = await KPIEntry.findByIdAndUpdate(
            id,
            {
                ...merged,
                assignee: user._id,
                assigneeName: user.name,
                variance: varianceStr,
                status,
                date: new Date(merged.date),
            },
            { new: true }
        ).lean();

        const impactedGoalIds = [existing.goalId, merged.goalId].filter(Boolean).map(String);
        for (const goalId of Array.from(new Set(impactedGoalIds))) {
            await this.syncGoalProgress(goalId);
        }

        return JSON.parse(JSON.stringify(updated));
    }

    async deleteKPIEntry(id: string) {
        await connectToDatabase();
        const entry = await KPIEntry.findByIdAndDelete(id).lean();
        if (entry?.goalId) {
            await this.syncGoalProgress(String(entry.goalId));
        }
        return { success: true };
    }
}

export const kpiService = new KPIService();
