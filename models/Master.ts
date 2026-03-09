import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMaster extends Document {
    type: string;
    label: string;
    value: string;
    order: number;
    isDefault: boolean;
    color?: string;
    isActive: boolean;
    metadata?: Record<string, any>;
}

const MasterSchema = new Schema<IMaster>({
    type: { type: String, required: true, index: true },
    label: { type: String, required: true },
    value: { type: String, required: true },
    order: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
    color: { type: String },
    isActive: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

// Compound index to ensure uniqueness within a type
MasterSchema.index({ type: 1, value: 1 }, { unique: true });

const Master: Model<IMaster> = mongoose.models.Master || mongoose.model<IMaster>("Master", MasterSchema);

export default Master;
