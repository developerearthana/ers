import mongoose, { Schema, Document } from 'mongoose';

export interface ICalendarEvent extends Document {
    date: Date;
    type: 'National Holiday' | 'State Holiday' | 'Sunday' | 'Office Managed Leave' | 'Working Day';
    caption: string;
    color: string; // Hex code or Tailwind class
    description?: string;
    createdBy?: mongoose.Types.ObjectId;
}

const CalendarEventSchema: Schema = new Schema({
    date: { type: Date, required: true, unique: true },
    type: {
        type: String,
        enum: ['National Holiday', 'State Holiday', 'Sunday', 'Office Managed Leave', 'Working Day'],
        required: true
    },
    caption: { type: String, required: true },
    color: { type: String, default: 'bg-red-50 text-red-700 border-red-200' },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.CalendarEvent || mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);
