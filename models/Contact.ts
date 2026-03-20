import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    type: 'Client' | 'Vendor' | 'Partner' | 'Lead';
    status: 'Active' | 'Inactive';
    address?: string;
    gstin?: string;
    category?: string; // e.g. "Software", "Hardware" for Vendors
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ContactSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
        company: { type: String },
        type: {
            type: String,
            enum: ['Client', 'Vendor', 'Partner', 'Lead', 'Consultant'],
            required: true
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active'
        },
        address: { type: String },
        gstin: { type: String },
        category: { type: String }, // Industry or Category
        notes: { type: String },
    },
    { timestamps: true }
);

// Indexes
ContactSchema.index({ type: 1 });
ContactSchema.index({ name: 1 });
ContactSchema.index({ company: 1 });

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);
