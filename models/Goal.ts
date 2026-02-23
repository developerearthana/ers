import mongoose, { Schema, Document } from 'mongoose';

export interface IGoal extends Document {
    title: string;
    description: string;
    subsidiary: string;
    department?: string; // e.g., "Sales", "HR"
    assignedTo?: mongoose.Types.ObjectId; // User ID (if individual goal)
    assignedToModel?: 'User' | 'Team' | 'Subsidiary'; // Context of assignment
    startDate: Date;
    endDate: Date;
    targetValue: string;
    metric: string;
    status: 'Not Started' | 'In Progress' | 'Completed' | 'At Risk';
    progress: number; // 0-100
    priority: 'Low' | 'Medium' | 'High';
    kpiTemplates: mongoose.Types.ObjectId[]; // Linked KPI Templates to track this goal
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const GoalSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        subsidiary: { type: String, required: true },
        department: { type: String },
        assignedTo: { type: Schema.Types.ObjectId, refPath: 'assignedToModel' },
        assignedToModel: { type: String, enum: ['User', 'Team', 'Subsidiary'], default: 'User' },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        targetValue: { type: String },
        metric: { type: String },
        status: { type: String, enum: ['Not Started', 'In Progress', 'Completed', 'At Risk'], default: 'Not Started' },
        progress: { type: Number, default: 0 },
        priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
        kpiTemplates: [{ type: Schema.Types.ObjectId, ref: 'KPITemplate' }],
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

GoalSchema.index({ subsidiary: 1, department: 1 });
GoalSchema.index({ assignedTo: 1 });

export default mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);
