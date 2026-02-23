import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    sku: string;
    category: string;
    quantity: number;
    minLevel: number;
    price: number;
    description?: string;
    status: 'Active' | 'Discontinued' | 'Archived';
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        sku: { type: String, required: true, unique: true },
        category: { type: String, required: true },
        quantity: { type: Number, default: 0 },
        minLevel: { type: Number, default: 5 },
        price: { type: Number, default: 0 },
        description: { type: String },
        status: {
            type: String,
            enum: ['Active', 'Discontinued', 'Archived'],
            default: 'Active'
        },
    },
    { timestamps: true }
);

// Indexes
ProductSchema.index({ sku: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ quantity: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
