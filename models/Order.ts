import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    orderId: string; // e.g., "ORD-2024-001"
    client: string;
    date: Date;
    amount: number;
    status: 'New' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    paymentStatus: 'Paid' | 'Pending' | 'Overdue';
    items?: any[]; /* simplistic for now */
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
    {
        orderId: { type: String, required: true, unique: true },
        client: { type: String, required: true },
        date: { type: Date, default: Date.now },
        amount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['New', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'New'
        },
        paymentStatus: {
            type: String,
            enum: ['Paid', 'Pending', 'Overdue'],
            default: 'Pending'
        }
    },
    { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
