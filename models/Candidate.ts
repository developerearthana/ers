import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
    name: string;
    email: string;
    phone: string;
    positionApplied: string;
    resumeUrl?: string; // URL to stored resume
    status: 'Applied' | 'Screening' | 'Interview' | 'Selected' | 'Rejected';
    interviewSchedule?: {
        date: Date;
        time: string;
        interviewer: string;
        link?: string;
    };
    remarks?: string[];
    createdAt: Date;
}

const CandidateSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    positionApplied: { type: String, required: true },
    resumeUrl: { type: String },
    status: {
        type: String,
        enum: ['Applied', 'Screening', 'Interview', 'Selected', 'Rejected'],
        default: 'Applied'
    },
    interviewSchedule: {
        date: { type: Date },
        time: { type: String },
        interviewer: { type: String },
        link: { type: String }
    },
    remarks: [{ type: String }],
}, { timestamps: true });

export default mongoose.models.Candidate || mongoose.model<ICandidate>('Candidate', CandidateSchema);
