import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemLog extends Document {
    action: string; // e.g., "User Login", "Project Created"
    details: string;
    user: string; // User Name or ID
    ip?: string;
    status: 'Success' | 'Warning' | 'Error' | 'Info';
    module?: string; // e.g., "Auth", "Projects"
    createdAt: Date;
}

const SystemLogSchema: Schema = new Schema(
    {
        action: { type: String, required: true },
        details: { type: String },
        user: { type: String, required: true },
        ip: { type: String },
        status: {
            type: String,
            enum: ['Success', 'Warning', 'Error', 'Info'],
            default: 'Info'
        },
        module: { type: String },
    },
    { timestamps: true }
);

// Indexes (TTL index for logs?)
SystemLogSchema.index({ createdAt: -1 });

export default mongoose.models.SystemLog || mongoose.model<ISystemLog>('SystemLog', SystemLogSchema);
