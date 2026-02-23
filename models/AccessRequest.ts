import mongoose, { Schema, Document } from 'mongoose';

export interface IAccessRequest extends Document {
    userId: mongoose.Types.ObjectId;
    ipAddress: string;
    location?: string;
    timestamp: Date;
    status: 'Pending' | 'Approved' | 'Rejected';
}

const AccessRequestSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        ipAddress: { type: String, required: true },
        location: { type: String },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending'
        },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.models.AccessRequest || mongoose.model<IAccessRequest>('AccessRequest', AccessRequestSchema);
