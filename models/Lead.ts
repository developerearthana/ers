import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
    name: string;
    company: string;
    email: string;
    phone?: string;
    contactId?: string;
    status: 'New' | 'Contacted' | 'Qualified' | 'Lost' | 'Converted';
    source?: string;
    notes?: string;
    remarks?: { status: string; note: string; date: Date }[];
    value?: number;
    probability?: number;
    createdAt: Date;
    updatedAt: Date;
}

const LeadSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        company: { type: String, required: true },
        email: { type: String },
        phone: { type: String },
        contactId: { type: Schema.Types.ObjectId, ref: 'Contact' }, // Link to Contact
        status: {
            type: String,
            enum: ['New', 'Contacted', 'Qualified', 'Lost', 'Converted'],
            default: 'New'
        },
        source: { type: String },
        notes: { type: String },
        remarks: [{
            status: String,
            note: String,
            date: { type: Date, default: Date.now }
        }],
        value: { type: Number, default: 0 },
        probability: { type: Number, default: 0 },
    },
    { timestamps: true }
);

LeadSchema.index({ status: 1 });
LeadSchema.index({ contactId: 1 });
LeadSchema.index({ createdAt: -1 });

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
