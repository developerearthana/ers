"use client";

import { use, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";

// Mock Data Function (In real app, this would be a server action or API call)
const getTransaction = async (id: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
        _id: id,
        voucherNo: `VCH-${id.split('-')[1] || '2024-001'}`,
        date: new Date().toISOString().split('T')[0],
        subsidiary: "Earthana India",
        location: "Head Office - Mumbai",
        type: "Expense",
        party: "Dell India Pvt Ltd",
        category: "Assets - IT Equipment",
        description: "Purchase of 5x Latitude Laptops for Sales Team",
        amount: 450000.00,
        amountInWords: "Four Lakh Fifty Thousand Rupees Only",
        paymentMode: "Bank Transfer",
        bankDetails: "HDFC Bank - **** 4582",
        preparedBy: "Rahul Admin",
        approvedBy: "Sishir Gupta"
    };
};

export default function VoucherPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const [transaction, setTransaction] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTransaction(resolvedParams.id).then(data => {
            setTransaction(data);
            setLoading(false);
        });
    }, [resolvedParams.id]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading Voucher...</div>;
    }

    if (!transaction) {
        return <div>Transaction not found</div>;
    }

    return (
        <div className="min-h-screen bg-background p-8 print:p-0 print:bg-white">
            {/* No-Print Header */}
            <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                        <Printer className="w-4 h-4" /> Print
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" /> Download PDF
                    </Button>
                </div>
            </div>

            {/* Voucher Container */}
            <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden print:shadow-none print:rounded-none">
                <div className="p-12 print:p-8 space-y-8">

                    {/* Header */}
                    <div className="border-b border-gray-200 pb-8 flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-widest">Payment Voucher</h1>
                            <p className="text-gray-500 mt-2">{transaction.subsidiary}</p>
                            <p className="text-sm text-gray-400">{transaction.location}</p>
                        </div>
                        <div className="text-right">
                            <div className="inline-block bg-background px-4 py-2 rounded-lg print:bg-transparent print:p-0 print:border print:border-gray-300">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Voucher No</p>
                                <p className="text-lg font-mono font-bold text-gray-900">{transaction.voucherNo}</p>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Date: <span className="font-medium text-gray-900">{format(new Date(transaction.date), "dd-MM-yyyy")}</span></p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Paid To</p>
                            <p className="text-lg font-medium text-gray-900">{transaction.party}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Payment Mode</p>
                            <p className="text-lg font-medium text-gray-900">{transaction.paymentMode}</p>
                            <p className="text-sm text-gray-500">{transaction.bankDetails}</p>
                        </div>

                        <div className="col-span-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Description / Particulars</p>
                            <div className="bg-background p-4 rounded-lg border border-gray-100 print:bg-transparent print:border-gray-300">
                                <p className="text-gray-800">{transaction.description}</p>
                                <p className="text-sm text-gray-500 mt-2">Category: {transaction.category}</p>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <div className="flex items-center justify-between border-t border-b border-gray-100 py-4 print:border-gray-300">
                                <span className="font-medium text-gray-600">Amount Paid</span>
                                <span className="text-3xl font-bold text-gray-900">₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2 italic capitalize">{transaction.amountInWords}</p>
                        </div>
                    </div>

                    {/* Footer Signatures */}
                    <div className="grid grid-cols-2 gap-12 pt-20 mt-12">
                        <div className="border-t border-gray-300 pt-4">
                            <p className="font-semibold text-gray-900">{transaction.preparedBy}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Prepared By</p>
                        </div>
                        <div className="border-t border-gray-300 pt-4 text-right">
                            <p className="font-semibold text-gray-900">{transaction.approvedBy}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Approved By</p>
                        </div>
                    </div>
                </div>

                {/* Print Footer */}
                <div className="bg-background p-4 text-center text-xs text-gray-400 print:hidden">
                    Generate by PlanRite ERP System • {new Date().toLocaleString()}
                </div>
            </div>
        </div>
    );
}
