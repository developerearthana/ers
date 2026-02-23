"use server";

import { z } from "zod";
import { createAction } from "@/lib/safe-action";
import { accountingService } from "@/services/AccountingService";
import { auth } from "@/auth";

const PettyCashSchema = z.object({
    subsidiary: z.string().min(1, "Subsidiary is required"),
    location: z.string().min(1, "Location is required"),
    type: z.enum(["Income", "Expense"]),
    party: z.string().min(1, "Party name is required"),
    category: z.string().min(1, "Category is required"),
    reference: z.string().min(1, "Reference No. is required"),
    date: z.string().min(1, "Date is required"),
    amount: z.string().min(1, "Amount is required"),
    remarks: z.string().optional(),
    paymentMode: z.string().min(1, "Payment Mode is required"),
    bankAccount: z.string().optional(),
});

export const createPettyCashEntry = createAction(PettyCashSchema, async (data) => {
    const session = await auth();
    const userId = session?.user?.id;

    try {
        const transaction = await accountingService.createPettyCashEntry(
            {
                ...data,
                amount: parseFloat(data.amount),
            },
            userId
        );

        return { success: true, id: transaction._id };
    } catch (error: any) {
        return { error: error.message || "Failed to create transaction" };
    }
});
