"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Save, Calendar as CalendarIcon, Wallet, Building2, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPettyCashEntry } from "@/app/actions/accounting";
import { toast } from "@/components/ui/toaster";
import { CardWrapper } from "@/components/ui/page-wrapper";

// --- Form Schema directly from Zod (Client side validation match) ---
const formSchema = z.object({
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

// --- Mock Data ---
const SUBSIDIARIES = ["Earthana India", "Earthana Global", "Earthana LLC"];
const LOCATIONS = ["Head Office - Mumbai", "Branch - Delhi", "Warehouse - Bhiwandi", "Remote"];
const CATEGORIES = ["Food", "Travel", "Office Supplies", "Services", "Utilities", "Maintenance", "Others"];
const PAYMENT_MODES = ["Cash", "Bank", "RTGS", "UPI", "NEFT", "Online Transfer", "Credit Card", "Debit Card"];
const BANK_ACCOUNTS = [
    { id: 1, name: "HDFC Bank - Current (**** 4582)" },
    { id: 2, name: "SBI - Savings (**** 7890)" },
    { id: 3, name: "ICICI Bank - Overdraft (**** 1234)" },
];

// Mock Location Balances
const LOCATION_BALANCES: Record<string, number> = {
    "Head Office - Mumbai": 25000,
    "Branch - Delhi": 12000,
    "Warehouse - Bhiwandi": 5000,
    "Remote": 0
};

interface TransactionFormProps {
    mode?: string;
}

export function TransactionForm({ mode }: TransactionFormProps) {
    const router = useRouter();

    // Server Action Hook
    const [state, formAction, isPending] = useActionState(createPettyCashEntry, {});

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            subsidiary: "",
            location: "",
            type: "Expense",
            party: "",
            category: "",
            reference: "",
            date: new Date().toISOString().split("T")[0],
            amount: "",
            remarks: "",
            paymentMode: "Cash",
            bankAccount: "",
        },
    });

    // Effect for Server Action Response
    useEffect(() => {
        if (state?.success) {
            toast.success("Transaction saved successfully!");
            if (state?.data?.id) {
                router.push(`/accounts/transactions/${state.data.id}/voucher`);
            } else {
                router.push("/accounts/transactions");
            }
        } else if (state?.error) {
            toast.error(state.error);
        } else if (state?.fieldErrors) {
            Object.entries(state.fieldErrors).forEach(([key, errors]) => {
                if (errors && errors.length > 0) {
                    form.setError(key as any, { type: 'server', message: errors[0] });
                }
            });
            toast.error("Please check the form for errors.");
        }
    }, [state, router, form]);


    // Watch inputs for dynamic logic
    const watchedPaymentMode = form.watch("paymentMode");
    const watchedLocation = form.watch("location");
    const watchedAmount = form.watch("amount");
    const watchedType = form.watch("type");

    const isCash = watchedPaymentMode === "Cash";
    const showBankAccount = !isCash && watchedPaymentMode;
    const locationBalance = isCash && watchedLocation ? LOCATION_BALANCES[watchedLocation] : null;

    const isExcessBalance =
        isCash &&
        watchedType === "Expense" &&
        locationBalance !== null &&
        !!watchedAmount &&
        parseFloat(watchedAmount) > locationBalance;

    return (
        <CardWrapper className="w-full max-w-5xl mx-auto glass-card border-none shadow-2xl p-0 overflow-hidden">

            <div className="bg-gradient-to-r from-gray-50 to-white border-b px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} type="button" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-full">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            New Transaction
                        </h2>
                    </div>
                </div>
                <div className="hidden md:block text-right">
                    {locationBalance !== null ? (
                        <div className="bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">Available Cash</p>
                            <p className="text-lg font-bold text-emerald-700">₹ {locationBalance.toLocaleString()}</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Draft Mode</p>
                            <p className="text-xs text-gray-400">ID: AVG-2024-X82</p>
                        </>
                    )}
                </div>
            </div>

            <form action={formAction} className="p-4 md:p-5 space-y-4">

                {/* Top Row: Context & Mode */}
                <div className="grid grid-cols-12 gap-3">
                    {/* Type Selection - Col 2 */}
                    <div className="col-span-12 md:col-span-2">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Type</label>
                        <div className="flex bg-white p-1 rounded-md h-9">
                            {["Expense", "Income"].map((type) => (
                                <label key={type} className="flex-1 cursor-pointer">
                                    <input type="radio" value={type} className="sr-only" {...form.register("type")} />
                                    <div className={`flex items-center justify-center h-full text-xs font-semibold rounded transition-all ${watchedType === type ? (type === 'Income' ? 'bg-green-100 text-green-700 shadow-sm' : 'bg-red-100 text-red-700 shadow-sm') : 'text-gray-500 hover:text-gray-700'}`}>
                                        {type}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Date - Col 2 */}
                    <div className="col-span-6 md:col-span-2">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Date</label>
                        <div className="relative">
                            <input type="date" className="w-full h-9 rounded-md border border-gray-200 bg-background/50 px-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none" {...form.register("date")} />
                        </div>
                    </div>

                    {/* Subsidiary - Col 3 */}
                    <div className="col-span-6 md:col-span-3">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Subsidiary</label>
                        <select className="w-full h-9 rounded-md border border-gray-200 bg-background/50 px-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none appearance-none" {...form.register("subsidiary")}>
                            <option value="" disabled>Select Organization</option>
                            {SUBSIDIARIES.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                    </div>

                    {/* Payment Mode - Col 2 */}
                    <div className="col-span-6 md:col-span-2">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Mode</label>
                        <select className="w-full h-9 rounded-md border border-gray-200 bg-background/50 px-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none appearance-none" {...form.register("paymentMode")}>
                            {PAYMENT_MODES.map((pm) => <option key={pm} value={pm}>{pm}</option>)}
                        </select>
                    </div>

                    {/* Location / Bank - Col 3 */}
                    <div className="col-span-6 md:col-span-3">
                        {isCash ? (
                            <>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Location</label>
                                <select className="w-full h-9 rounded-md border border-gray-200 bg-background/50 px-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none appearance-none" {...form.register("location")}>
                                    <option value="" disabled>Select Location</option>
                                    {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                                </select>
                            </>
                        ) : (
                            <>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Bank Account</label>
                                <select className="w-full h-9 rounded-md border border-gray-200 bg-background/50 px-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none appearance-none" {...form.register("bankAccount")}>
                                    <option value="" disabled>Select Bank</option>
                                    {BANK_ACCOUNTS.map((acc) => <option key={acc.id} value={acc.name}>{acc.name}</option>)}
                                </select>
                            </>
                        )}
                    </div>
                </div>

                {/* Middle Row: The Core Transaction Data */}
                <div className="grid grid-cols-12 gap-4 bg-background/50 p-3 rounded-lg border border-gray-100">
                    {/* Amount - Big & Prominent - Col 3 */}
                    <div className="col-span-12 md:col-span-3">
                        <label className="text-xs font-bold text-gray-700 mb-1 block">AMOUNT (₹)</label>
                        <div className="relative">
                            <Input
                                type="number" step="0.01" placeholder="0.00"
                                className="h-10 text-xl font-bold text-gray-900 border-gray-200 shadow-sm focus:border-primary"
                                {...form.register("amount")}
                            />
                        </div>
                        {isExcessBalance && (
                            <div className="absolute mt-1 z-10 bg-red-50 border border-red-200 text-red-600 text-[10px] p-1.5 rounded shadow-lg flex gap-1 items-center animate-in fade-in zoom-in-95">
                                <Wallet className="w-3 h-3" /> Insufficient Cash
                            </div>
                        )}
                    </div>

                    {/* Party - Col 4 */}
                    <div className="col-span-12 md:col-span-4">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Paid To / Received From</label>
                        <Input placeholder="Name" className="h-10 text-sm" {...form.register("party")} />
                    </div>

                    {/* Category - Col 3 */}
                    <div className="col-span-6 md:col-span-3">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Category</label>
                        <select className="w-full h-10 rounded-md border border-gray-200 bg-white px-2 text-sm focus:ring-1 focus:ring-primary/20 outline-none" {...form.register("category")}>
                            <option value="" disabled>Select</option>
                            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    {/* Reference - Col 2 */}
                    <div className="col-span-6 md:col-span-2">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Ref #</label>
                        <Input placeholder="Inv No" className="h-10 text-sm" {...form.register("reference")} />
                    </div>
                </div>

                {/* Bottom Row: Remarks */}
                <div>
                    <Textarea placeholder="Add remarks or narration..." className="min-h-[60px] resize-none text-xs bg-background/30" {...form.register("remarks")} />
                </div>

                {/* Errors & Footer */}
                <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-red-500 font-medium truncate max-w-[50%]">
                        {(Object.keys(form.formState.errors).length > 0) && "Please fix the errors above."}
                    </div>
                    <div className="flex gap-3">
                        <Button type="button" variant="ghost" size="sm" onClick={() => router.back()} disabled={isPending} className="text-xs h-8">
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={isPending || !!isExcessBalance} className={cn("h-8 px-4 text-xs font-semibold transition-all hover:-translate-y-0.5", isExcessBalance ? "bg-white" : "bg-primary hover:bg-green-600 shadow-green-200")}>
                            {isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Save className="mr-1 h-3 w-3" />}
                            Save Entry
                        </Button>
                    </div>
                </div>
            </form>
        </CardWrapper>
    );
}

