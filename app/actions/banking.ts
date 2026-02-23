"use server";

import { z } from "zod";
import { createAction, createJSONAction } from "@/lib/safe-action";
import connectToDatabase from "@/lib/db";
import BankAccount from "@/models/BankAccount";
import { revalidatePath } from "next/cache";

// --- EXISTING SCHEMAS ---
const BankAccountSchema = z.object({
    bankName: z.string().min(1, "Bank Name is required"),
    accountName: z.string().min(1, "Account Name is required"),
    accountNumber: z.string().min(5, "Valid Account Number is required"),
    accountType: z.enum(["Savings", "Current", "Overdraft", "Credit Card"]),
    branch: z.string().optional(),
    ifscCode: z.string().optional(),
    openingBalance: z.coerce.number().default(0),
    isActive: z.boolean().default(true),
});

const TransactionSchema = z.object({
    accountId: z.string().min(1, "Account ID is required"),
    type: z.enum(["Deposit", "Withdrawal"]),
    amount: z.coerce.number().min(1, "Amount must be greater than 0"),
    date: z.string().min(1, "Date is required"),
    description: z.string().min(1, "Description is required"),
    reference: z.string().optional(), // Check/Ref No
});

// --- ACTIONS ---

export const createBankAccount = createAction(BankAccountSchema, async (data) => {
    await connectToDatabase();
    try {
        const newAccount = await BankAccount.create({
            ...data,
            currentBalance: data.openingBalance,
        });
        revalidatePath("/accounts/banking");
        return { success: true, data: JSON.parse(JSON.stringify(newAccount)) };
    } catch (error: any) {
        if (error.code === 11000) {
            return { error: "Account Number already exists" };
        }
        return { error: "Failed to create bank account" };
    }
});

export const getBankAccounts = async () => {
    await connectToDatabase();
    const accounts = await BankAccount.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(accounts));
};

export const recordBankTransaction = createJSONAction(TransactionSchema, async (data) => {
    await connectToDatabase();

    try {
        const account = await BankAccount.findById(data.accountId);
        if (!account) throw new Error("Account not found");

        let newBalance = account.currentBalance;
        if (data.type === 'Deposit') {
            newBalance += data.amount;
        } else {
            newBalance -= data.amount;
        }

        // Update Balance
        await BankAccount.findByIdAndUpdate(data.accountId, { currentBalance: newBalance });

        revalidatePath(`/accounts/banking/${data.accountId}`);
        revalidatePath("/accounts/banking");

        return { newBalance };
    } catch (error: any) {
        throw new Error(error.message || "Failed to record transaction");
    }
});
