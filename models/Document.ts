import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
    name: string;
    folderId?: string; // Root if null
    url: string; // Path or URL
    type: string; // MIME type
    size: number; // Bytes
    uploadedBy: string;
}

const DocumentSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        folderId: { type: Schema.Types.ObjectId, ref: 'Folder' },
        url: { type: String, required: true },
        type: { type: String },
        size: { type: Number },
        uploadedBy: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
