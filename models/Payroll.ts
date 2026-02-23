import mongoose, { Schema, Document } from 'mongoose';

export interface IPayroll extends Document {
    employeeId: string; // User ID
    employeeName: string;
    month: string; // e.g. "October 2025"
    status: 'Paid' | 'Pending' | 'Processing';
    salary: {
        basic: number;
        hra: number;
        allowances: number;
        gross: number;
    };
    deductions: {
        tax: number;
        pf: number;
        lop: number; // Loss of Pay
        other: number;
        total: number;
    };
    netPay: number;
    paymentDate?: Date;
}

const PayrollSchema: Schema = new Schema(
    {
        employeeId: { type: String, required: true },
        employeeName: { type: String, required: true },
        month: { type: String, required: true },
        status: {
            type: String,
            enum: ['Paid', 'Pending', 'Processing'],
            default: 'Pending'
        },
        salary: {
            basic: { type: Number, default: 0 },
            hra: { type: Number, default: 0 },
            allowances: { type: Number, default: 0 },
            gross: { type: Number, default: 0 },
        },
        deductions: {
            tax: { type: Number, default: 0 },
            pf: { type: Number, default: 0 },
            lop: { type: Number, default: 0 },
            other: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
        },
        netPay: { type: Number, default: 0 },
        paymentDate: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.models.Payroll || mongoose.model<IPayroll>('Payroll', PayrollSchema);
