import mongoose, { Schema, Document } from 'mongoose';

export interface IAssetAssignment extends Document {
    assetId: mongoose.Types.ObjectId;
    assignedTo: mongoose.Types.ObjectId;
    assignedBy: mongoose.Types.ObjectId;
    assignedDate: Date;
    returnDate?: Date;
    conditionOnAssign?: string;
    conditionOnReturn?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AssetAssignmentSchema: Schema = new Schema({
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedDate: { type: Date, default: Date.now },
    returnDate: { type: Date },
    conditionOnAssign: { type: String },
    conditionOnReturn: { type: String },
    notes: { type: String }
}, {
    timestamps: true
});

export default mongoose.models.AssetAssignment || mongoose.model<IAssetAssignment>('AssetAssignment', AssetAssignmentSchema);
