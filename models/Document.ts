import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
    name: string;
    folderId?: string;
    url: string;
    type: string;
    size: number;
    uploadedBy: string;
    uploadedByName?: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
}

const DocumentSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        folderId: { type: Schema.Types.ObjectId, ref: 'Folder' },
        url: { type: String, required: true },
        type: { type: String },
        size: { type: Number },
        uploadedBy: { type: String, required: true },
        uploadedByName: { type: String },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        rejectionReason: { type: String },
    },
    { timestamps: true }
);

export default mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
