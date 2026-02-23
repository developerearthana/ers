import connectToDatabase from '@/lib/db';
import KPIEntry from '@/models/KPIEntry';
import KPITemplate from '@/models/KPITemplate';
import User from '@/models/User';
import { sanitizeObject } from '@/lib/sanitize';

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

export class KPIService {
    /**
     * Create a new KPI entry
     */
    async createKPIEntry(data: KPIEntryData) {
        await connectToDatabase();
        const sanitized = sanitizeObject(data);

        // Calculate variance and status
        const targetVal = parseFloat(sanitized.target.replace(/[^0-9.-]+/g, ""));
        const actualVal = parseFloat(sanitized.actual.replace(/[^0-9.-]+/g, ""));

        let varianceStr = "0%";
        let status = "Met";

        if (!isNaN(targetVal) && !isNaN(actualVal) && targetVal !== 0) {
            const diff = actualVal - targetVal;
            const variancePercent = (diff / targetVal) * 100;
            const sign = variancePercent > 0 ? "+" : "";
            varianceStr = `${sign}${variancePercent.toFixed(1)}%`;

            if (variancePercent > 10) status = "Exceeded";
            else if (variancePercent < -10) status = "Missed";
        }

        // Find user by name to get ID (since frontend sends name currently)
        // Ideally frontend should send ID, but for compatibility with existing UI flow:
        let userId = null;
        const user = await User.findOne({ name: sanitized.assignee });
        if (user) {
            userId = user._id;
        }

        if (!userId) {
            throw new Error(`Assignee '${sanitized.assignee}' not found in database.`);
        }

        const entry = await KPIEntry.create({
            ...sanitized,
            assignee: userId,
            assigneeName: sanitized.assignee,
            variance: varianceStr,
            status,
            date: new Date(sanitized.date),
        });

        return JSON.parse(JSON.stringify(entry));
    }

    /**
     * Get all KPI entries
     */
    /**
     * Get all KPI entries
     */
    async getKPIEntries() {
        await connectToDatabase();
        const entries = await KPIEntry.find({})
            .populate('assignee', 'name email image')
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
        const templates = await KPITemplate.find(filters).sort({ industry: 1, department: 1 }).lean();
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
}

export const kpiService = new KPIService();
