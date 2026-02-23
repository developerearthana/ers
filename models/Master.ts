import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMaster extends Document {
    type: string;        // e.g., 'ContactType', 'LeadStatus', 'VendorCategory'
    label: string;       // e.g., 'Client', 'New', 'Material Supplier'
    value: string;       // e.g., 'Client', 'New', 'Material Supplier'
    order: number;       // For sorting
    isDefault: boolean;  // Pre-selected option
    color?: string;      // Optional Badge color class
    isActive: boolean;
}

const MasterSchema = new Schema<IMaster>({
    type: { type: String, required: true, index: true },
    label: { type: String, required: true },
    value: { type: String, required: true },
    order: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
    color: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Compound index to ensure uniqueness within a type
MasterSchema.index({ type: 1, value: 1 }, { unique: true });

const Master: Model<IMaster> = mongoose.models.Master || mongoose.model<IMaster>("Master", MasterSchema);

export default Master;
