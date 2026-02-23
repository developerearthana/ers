import mongoose, { Schema, Document } from 'mongoose';

export interface IKPITemplate extends Document {
    name: string;
    industry: string; // e.g., "Construction", "IT", "Manufacturing"
    department: string; // e.g., "Sales", "Engineering", "HR"
    description: string;
    unit: string; // e.g., "%", "Currency", "Count"
    calcMethod: 'Sum' | 'Average' | 'Latest';
    defaultTarget: string;
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const KPITemplateSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        industry: { type: String, required: true }, // Taxonomies for filtering
        department: { type: String, required: true },
        description: { type: String },
        unit: { type: String, default: 'Count' },
        calcMethod: { type: String, enum: ['Sum', 'Average', 'Latest'], default: 'Sum' },
        defaultTarget: { type: String },
        frequency: { type: String, enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', 'Project'], default: 'Monthly' },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

// Index for easy searching
KPITemplateSchema.index({ industry: 1, department: 1 });

export default mongoose.models.KPITemplate || mongoose.model<IKPITemplate>('KPITemplate', KPITemplateSchema);
