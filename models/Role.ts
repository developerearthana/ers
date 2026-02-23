import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
    name: string;
    description?: string;
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
}

const RoleSchema: Schema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String },
        permissions: { type: [String], default: [] }, // Array of module keys e.g. ['sales', 'marketing']
    },
    { timestamps: true }
);

export default mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);
