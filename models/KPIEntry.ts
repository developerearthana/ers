import mongoose, { Schema, Document } from 'mongoose';

export interface IKPIEntry extends Document {
    week: string;
    subsidiary: string;
    metric: string;
    assignee: mongoose.Types.ObjectId; // Reference to User
    templateId?: mongoose.Types.ObjectId;
    assigneeName: string;
    goalId?: mongoose.Types.ObjectId;
    team: string;
    target: string;
    actual: string;
    variance: string;
    status: 'Exceeded' | 'Met' | 'Missed';
    comment: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}

const KPIEntrySchema: Schema = new Schema(
    {
        week: { type: String, required: true },
        subsidiary: { type: String, required: true },
        metric: { type: String, required: true },
        assignee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        templateId: { type: Schema.Types.ObjectId, ref: 'KPITemplate' }, // Link to library
        assigneeName: { type: String },
        goalId: { type: Schema.Types.ObjectId, ref: 'Goal' }, // Specific goal context
        team: { type: String, required: true },
        target: { type: String, required: true },
        actual: { type: String, required: true },
        variance: { type: String },
        status: { type: String, enum: ['Exceeded', 'Met', 'Missed'], default: 'Met' },
        comment: { type: String },
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Indexes for filtering
KPIEntrySchema.index({ week: 1 });
KPIEntrySchema.index({ subsidiary: 1 });
KPIEntrySchema.index({ team: 1 });
KPIEntrySchema.index({ assignee: 1 });

export default mongoose.models.KPIEntry || mongoose.model<IKPIEntry>('KPIEntry', KPIEntrySchema);
