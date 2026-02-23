import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
    name: string;
    type: 'Social Media' | 'Email' | 'PPC' | 'Content' | 'Offline';
    status: 'Active' | 'Scheduled' | 'Completed' | 'Paused';
    budget: number;
    spent: number;
    startDate: Date;
    endDate?: Date;
    metrics: {
        clicks?: number;
        impressions?: number;
        conversions?: number;
        roi?: number; // percent
    };
}

const CampaignSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ['Social Media', 'Email', 'PPC', 'Content', 'Offline'],
            default: 'Social Media'
        },
        status: {
            type: String,
            enum: ['Active', 'Scheduled', 'Completed', 'Paused'],
            default: 'Scheduled'
        },
        budget: { type: Number, default: 0 },
        spent: { type: Number, default: 0 },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date },
        metrics: {
            clicks: { type: Number, default: 0 },
            impressions: { type: Number, default: 0 },
            conversions: { type: Number, default: 0 },
            roi: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

export default mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);
