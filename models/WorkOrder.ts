import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkOrder extends Document {
    title: string;
    type: 'Internal' | 'Vendor';
    project: string; // Project Name or ID
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Open' | 'In Progress' | 'Completed' | 'On Hold';
    assignee: string; // User Name or Vendor Name
    date: Date;
    location?: string;
    cost: number;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const WorkOrderSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        type: { type: String, enum: ['Internal', 'Vendor'], required: true },
        project: { type: String, required: true },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical'],
            default: 'Medium'
        },
        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Completed', 'On Hold'],
            default: 'Open'
        },
        assignee: { type: String, required: true },
        date: { type: Date, default: Date.now },
        location: { type: String },
        cost: { type: Number, default: 0 },
        description: { type: String },
    },
    { timestamps: true }
);

// Indexes
WorkOrderSchema.index({ status: 1 });
WorkOrderSchema.index({ assignee: 1 });
WorkOrderSchema.index({ project: 1 });

export default mongoose.models.WorkOrder || mongoose.model<IWorkOrder>('WorkOrder', WorkOrderSchema);
