import connectToDatabase from '@/lib/db';
import Appraisal from '@/models/Appraisal';
import User from '@/models/User';
import { sanitizeObject } from '@/lib/sanitize';

export interface AppraisalData {
    employeeId: string;
    reviewerId: string;
    period: string;
    status?: string;
    goalsScore?: number;
    behavioralScore?: number;
    finalScore?: number;
    feedback?: string;
    strengths?: string[];
    improvements?: string[];
    meetingDate?: string;
}

export class AppraisalService {
    /**
     * Create a new Appraisal
     */
    async createAppraisal(data: AppraisalData) {
        await connectToDatabase();
        const sanitized = sanitizeObject(data);

        // Verify Employee and Reviewer exist
        const employee = await User.findById(sanitized.employeeId);
        const reviewer = await User.findById(sanitized.reviewerId);

        if (!employee || !reviewer) {
            throw new Error("Invalid Employee or Reviewer ID");
        }

        const appraisal = await Appraisal.create(sanitized);
        return JSON.parse(JSON.stringify(appraisal));
    }

    /**
     * Get Appraisals with Filters
     */
    async getAppraisals(filters: any = {}) {
        await connectToDatabase();
        const appraisals = await Appraisal.find(filters)
            .populate('employeeId', 'name email dept jobTitle image')
            .populate('reviewerId', 'name email jobTitle')
            .sort({ createdAt: -1 })
            .lean();

        return JSON.parse(JSON.stringify(appraisals)).map((a: any) => ({
            ...a,
            id: a._id.toString()
        }));
    }

    /**
     * Update Appraisal
     */
    async updateAppraisal(id: string, data: Partial<AppraisalData>) {
        await connectToDatabase();
        const sanitized = sanitizeObject(data);

        const appraisal = await Appraisal.findByIdAndUpdate(
            id,
            { $set: sanitized },
            { new: true }
        ).lean();

        if (!appraisal) throw new Error("Appraisal not found");

        return JSON.parse(JSON.stringify(appraisal));
    }
}

export const appraisalService = new AppraisalService();
