import mongoose, { Schema, Document } from 'mongoose';

export interface IDeal extends Document {
    title: string;
    client: string; // Could be a link to a Company collection later
    value: number;
    stage: 'Discovery' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
    probability: number;
    expectedCloseDate: Date;
    owner: string; // Sales rep
    createdAt: Date;
    updatedAt: Date;
}

const DealSchema: Schema = new Schema(
    {
        title: { type: String, required: true }, // e.g., "SaaS License - Acme Corp"
        client: { type: String, required: true },
        value: { type: Number, required: true },
        stage: {
            type: String,
            enum: ['Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
            default: 'Discovery'
        },
        probability: { type: Number, default: 20 },
        expectedCloseDate: { type: Date },
        owner: { type: String },
    },
    { timestamps: true }
);

// Indexes
DealSchema.index({ stage: 1 });
DealSchema.index({ client: 1 });

export default mongoose.models.Deal || mongoose.model<IDeal>('Deal', DealSchema);
