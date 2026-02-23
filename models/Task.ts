import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
    title: string;
    description?: string;
    status: 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'Archived';
    priority: 'Low' | 'Medium' | 'High';
    dueDate?: Date;
    assignees: string[]; // User IDs
    tags: string[];
    attachments: string[]; // URLs or Paths
    checklist?: { text: string; completed: boolean }[];
    remarks?: string; // New field for comments/notes
    project?: string; // Linked Project
    teamId?: string; // Linked Conversation/Group ID
    createdBy: string;
}

const TaskSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        status: {
            type: String,
            enum: ['To Do', 'In Progress', 'In Review', 'Done', 'Archived'],
            default: 'To Do'
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium'
        },
        dueDate: { type: Date },
        assignees: [{ type: String }],
        tags: [{ type: String }],
        attachments: [{ type: String }],
        checklist: [{
            text: { type: String, required: true },
            completed: { type: Boolean, default: false }
        }],
        remarks: { type: String },
        project: { type: String },
        teamId: { type: String }, // Linked Conversation/Group ID
        createdBy: { type: String }, // Made optional for now to debug saving issues
    },
    { timestamps: true }
);

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
