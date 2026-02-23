import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPettyCashTransaction extends Document {
    subsidiary: string;
    location: string;
    type: "Income" | "Expense";
    party: string;
    category: string;
    reference: string;
    amount: number;
    remarks?: string;
    paymentMode:
    | "Cash"
    | "Bank"
    | "RTGS"
    | "UPI"
    | "NEFT"
    | "Online Transfer"
    | "Credit Card"
    | "Debit Card";
    bankAccount?: string;
    status: "Pending" | "Approved" | "Rejected";
    approvedBy?: mongoose.Types.ObjectId;
    approvalDate?: Date;
    date: Date;
    createdBy?: mongoose.Types.ObjectId;
}

const PettyCashTransactionSchema = new Schema<IPettyCashTransaction>(
    {
        subsidiary: {
            type: String,
            required: [true, "Subsidiary is required"],
        },
        location: {
            type: String,
            required: [true, "Location is required"],
        },
        type: {
            type: String,
            required: [true, "Transaction Type is required"],
            enum: ["Income", "Expense"],
        },
        party: {
            type: String,
            required: [true, "Party (From/To) is required"],
        },
        category: {
            type: String,
            required: [true, "Expense Category is required"],
        },
        reference: {
            type: String,
            required: [true, "Reference is required"],
        },
        amount: {
            type: Number,
            required: [true, "Amount is required"],
        },
        remarks: {
            type: String,
        },
        paymentMode: {
            type: String,
            required: [true, "Payment Mode is required"],
            enum: [
                "Cash",
                "Bank",
                "RTGS",
                "UPI",
                "NEFT",
                "Online Transfer",
                "Credit Card",
                "Debit Card",
            ],
            default: "Cash",
        },
        bankAccount: {
            type: String,
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        approvalDate: {
            type: Date,
        },
        date: {
            type: Date,
            required: [true, "Date is required"],
            default: Date.now,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

const PettyCashTransaction: Model<IPettyCashTransaction> =
    mongoose.models.PettyCashTransaction ||
    mongoose.model<IPettyCashTransaction>(
        "PettyCashTransaction",
        PettyCashTransactionSchema
    );

export default PettyCashTransaction;
