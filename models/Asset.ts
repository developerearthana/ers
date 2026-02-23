import mongoose, { Schema, Document } from 'mongoose';

export interface IAsset extends Document {
    name: string;
    description?: string;
    category: 'Laptop' | 'Desktop' | 'Monitor' | 'Vehicle' | 'Furniture' | 'License' | 'Other';
    modelNo?: string;
    serialNo?: string;
    purchaseDate: Date;
    purchasePrice: number;
    currentValue?: number;
    status: 'Available' | 'Assigned' | 'Maintenance' | 'Retired' | 'Lost';
    assignedTo?: mongoose.Types.ObjectId; // User ID
    assignedDate?: Date;
    warrantyExpiry?: Date;
    location?: string;
    image?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const AssetSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: {
        type: String,
        enum: ['Laptop', 'Desktop', 'Monitor', 'Vehicle', 'Furniture', 'License', 'Other'],
        required: true
    },
    modelNo: { type: String },
    serialNo: { type: String },
    purchaseDate: { type: Date, required: true },
    purchasePrice: { type: Number, required: true },
    currentValue: { type: Number },
    status: {
        type: String,
        enum: ['Available', 'Assigned', 'Maintenance', 'Retired', 'Lost'],
        default: 'Available'
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedDate: { type: Date },
    warrantyExpiry: { type: Date },
    location: { type: String },
    image: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

export default mongoose.models.Asset || mongoose.model<IAsset>('Asset', AssetSchema);
