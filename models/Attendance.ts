import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
    userId: mongoose.Types.ObjectId;
    date: Date;
    punchIn?: Date;
    punchOut?: Date;
    status: 'Present' | 'Absent' | 'WFH' | 'Leave' | 'Half-Day';
    workMode: 'Office' | 'Remote';
    hoursWorked?: number;
    overtime?: number;
    remarks?: string;
}

const AttendanceSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    punchIn: { type: Date },
    punchOut: { type: Date },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'WFH', 'Leave', 'Half-Day'],
        default: 'Absent'
    },
    workMode: {
        type: String,
        enum: ['Office', 'Remote'],
        default: 'Office'
    },
    hoursWorked: { type: Number, default: 0 },
    overtime: { type: Number, default: 0 },
    remarks: { type: String }
}, { timestamps: true });

// Compound index to ensure one attendance record per user per day
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
