import mongoose, { Schema, Document } from 'mongoose';

export interface IAppraisal extends Document {
    employeeId: mongoose.Types.ObjectId;
    reviewerId: mongoose.Types.ObjectId;
    period: string; // e.g., "Q4 FY25-26"
    status: 'Scheduled' | 'In Progress' | 'Completed' | 'Signed';
    goalsScore: number; // 0-100 derived from KPIs
    behavioralScore: number; // 0-100
    finalScore: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    meetingDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AppraisalSchema: Schema = new Schema(
    {
        employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        period: { type: String, required: true },
        status: { type: String, enum: ['Scheduled', 'In Progress', 'Completed', 'Signed'], default: 'Scheduled' },
        goalsScore: { type: Number, default: 0 },
        behavioralScore: { type: Number, default: 0 },
        finalScore: { type: Number, default: 0 },
        feedback: { type: String },
        strengths: [{ type: String }],
        improvements: [{ type: String }],
        meetingDate: { type: Date },
    },
    { timestamps: true }
);

AppraisalSchema.index({ employeeId: 1, period: 1 });

export default mongoose.models.Appraisal || mongoose.model<IAppraisal>('Appraisal', AppraisalSchema);
