import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    userId?: mongoose.Types.ObjectId;
    action: string;
    resource: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    status: 'success' | 'failure' | 'warning';
    details?: Record<string, any>;
    timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        action: {
            type: String,
            required: true,
            index: true,
        },
        resource: {
            type: String,
            required: true,
            index: true,
        },
        resourceId: {
            type: String,
            index: true,
        },
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        },
        status: {
            type: String,
            enum: ['success', 'failure', 'warning'],
            required: true,
            index: true,
        },
        details: {
            type: Schema.Types.Mixed,
        },
        timestamp: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: false, // Using custom timestamp field
    }
);

// Index for efficient querying
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, timestamp: -1 });
AuditLogSchema.index({ status: 1, timestamp: -1 });

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
