import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchaseOrder extends Document {
    poNumber: string;
    vendor: string; // Vendor Name or ID
    date: Date;
    items: {
        description: string;
        quantity: number;
        rate: number;
        amount: number;
    }[];
    totalValue: number;
    status: 'Draft' | 'Sent' | 'Partially Received' | 'Completed' | 'Overdue';
    deliveryDate?: Date;
    notes?: string;
}

const PurchaseOrderSchema: Schema = new Schema(
    {
        poNumber: { type: String, required: true, unique: true },
        vendor: { type: String, required: true },
        date: { type: Date, default: Date.now },
        items: [{
            description: String,
            quantity: Number,
            rate: Number,
            amount: Number
        }],
        totalValue: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['Draft', 'Sent', 'Partially Received', 'Completed', 'Overdue'],
            default: 'Draft'
        },
        deliveryDate: { type: Date },
        notes: { type: String },
    },
    { timestamps: true }
);

export default mongoose.models.PurchaseOrder || mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);
