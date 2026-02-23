import mongoose, { Schema, Document } from 'mongoose';

export interface IPermission extends Document {
    code: string;
    description: string;
    module: string;
}

const PermissionSchema: Schema = new Schema({
    code: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    module: { type: String, required: true },
});

export default mongoose.models.Permission || mongoose.model<IPermission>('Permission', PermissionSchema);
