import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveRequest extends Document {
    userId: mongoose.Types.ObjectId; // Reference to User
    userName: string; // Denormalized for simpler display
    type: 'Sick' | 'Casual' | 'Festival' | 'Emergency' | 'Other';
    startDate: Date;
    endDate: Date;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    approverId?: mongoose.Types.ObjectId;
    createdAt: Date;
}

const LeaveRequestSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    type: {
        type: String,
        enum: ['Sick', 'Casual', 'Festival', 'Emergency', 'Other'],
        required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    approverId: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
