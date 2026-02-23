import mongoose, { Schema, Document } from 'mongoose';

export interface IFolder extends Document {
    name: string;
    parentId?: string; // If nested
    createdBy: string; // User ID
    path: string; // For breadcrumbs logic, optional but helpful
}

const FolderSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        parentId: { type: Schema.Types.ObjectId, ref: 'Folder' },
        createdBy: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.models.Folder || mongoose.model<IFolder>('Folder', FolderSchema);
