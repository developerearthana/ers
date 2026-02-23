import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
    invoiceId: string; // e.g., "INV-2024-001"
    client: string;
    issueDate: Date;
    dueDate: Date;
    amount: number;
    status: 'Paid' | 'Unpaid' | 'Overdue';
    createdAt: Date;
    updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema(
    {
        invoiceId: { type: String, required: true, unique: true },
        client: { type: String, required: true },
        issueDate: { type: Date, default: Date.now },
        dueDate: { type: Date, required: true },
        amount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['Paid', 'Unpaid', 'Overdue'],
            default: 'Unpaid'
        }
    },
    { timestamps: true }
);

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
