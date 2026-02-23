import mongoose from "mongoose";

const BankAccountSchema = new mongoose.Schema({
    bankName: {
        type: String,
        required: [true, "Bank Name is required"],
        trim: true,
    },
    accountName: {
        type: String,
        required: [true, "Account Name / Label is required"], // e.g., "Main Operational Account"
        trim: true,
    },
    accountNumber: {
        type: String,
        required: [true, "Account Number is required"],
        unique: true,
    },
    accountType: {
        type: String,
        enum: ["Savings", "Current", "Overdraft", "Credit Card"],
        default: "Current",
    },
    branch: String,
    ifscCode: String,
    openingBalance: {
        type: Number,
        default: 0,
    },
    currentBalance: {
        type: Number,
        default: 0,
    },
    currency: {
        type: String,
        default: "INR",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.BankAccount || mongoose.model("BankAccount", BankAccountSchema);
