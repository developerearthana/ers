"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Search, Filter, Download, MoreHorizontal, ArrowUpDown, Printer } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "@/components/ui/toaster";
import { motion } from "framer-motion";

interface Transaction {
    _id: string;
    date: string;
    subsidiary: string;
    location: string;
    type: string;
    party: string;
    category: string;
    reference: string;
    amount: number;
    remarks: string;
    paymentMode: string;
    status: string;
}

interface PettyCashTableProps {
    transactions: Transaction[];
    loading: boolean;
    onUpdate?: () => void;
}

export function PettyCashTable({ transactions, loading, onUpdate }: PettyCashTableProps) {
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleStatusUpdate = async (id: string, status: 'Approved' | 'Rejected') => {
        setUpdatingId(id);
        try {
            const res = await fetch('/api/accounting/petty-cash', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            if (res.ok) {
                toast.success(`Transaction ${status.toLowerCase()} successfully`);
                if (onUpdate) onUpdate();
            } else {
                toast.error("Failed to update transaction status");
            }
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error("Network error occurred");
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-100/50 text-emerald-700 border-emerald-200';
            case 'Rejected': return 'bg-red-100/50 text-red-700 border-red-200';
            default: return 'bg-amber-100/50 text-amber-700 border-amber-200';
        }
    };

    if (loading) {
        return (
            <div className="w-full h-96 flex flex-col items-center justify-center gap-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm animate-pulse">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-muted-foreground text-sm font-medium">Loading ledger...</p>
            </div>
        )
    }

    return (
        <div className="glass-card overflow-hidden border border-white/40 shadow-xl rounded-xl bg-white/60 dark:bg-white/60 backdrop-blur-xl">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        placeholder="Search transactions..."
                        className="w-full h-9 pl-9 pr-4 rounded-lg bg-secondary/10 border border-transparent focus:bg-white focus:border-primary/20 text-sm transition-all outline-none"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="h-9 gap-2 border-gray-200 bg-white/50 hover:bg-white">
                        <Filter className="h-3.5 w-3.5" />
                        Filter
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 gap-2 border-gray-200 bg-white/50 hover:bg-white">
                        <ArrowUpDown className="h-3.5 w-3.5" />
                        Sort
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 gap-2 border-gray-200 bg-white/50 hover:bg-white">
                        <Download className="h-3.5 w-3.5" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-background/50">
                        <TableRow className="hover:bg-transparent border-gray-100">
                            <TableHead className="w-[120px] font-semibold text-gray-600">Date</TableHead>
                            <TableHead className="font-semibold text-gray-600">Details</TableHead>
                            <TableHead className="font-semibold text-gray-600">Party</TableHead>
                            <TableHead className="font-semibold text-gray-600">Category</TableHead>
                            <TableHead className="font-semibold text-gray-600">Status</TableHead>
                            <TableHead className="font-semibold text-gray-600 text-right">Actions</TableHead>
                            <TableHead className="text-right font-semibold text-gray-600">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-16">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
                                            <Search className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
                                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                            Try adjusting your filters or search query, or create a new entry.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((t, index) => (
                                <motion.tr
                                    key={t._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className="group hover:bg-white/30 transition-colors border-gray-100"
                                >
                                    <TableCell className="font-medium text-gray-700">
                                        {format(new Date(t.date), "dd-MM-yyyy")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm text-gray-900">{t.reference}</span>
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.location}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                {t.party?.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{t.party}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex px-2 py-0.5 rounded text-xs bg-white text-gray-600 border border-gray-200">
                                            {t.category}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(t.status)}`}>
                                            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${t.status === 'Approved' ? 'bg-emerald-500' : (t.status === 'Rejected' ? 'bg-red-500' : 'bg-amber-500')}`}></span>
                                            {t.status || 'Pending'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {(t.status === 'Pending' || !t.status) ? (
                                                <>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full"
                                                        onClick={() => handleStatusUpdate(t._id, 'Approved')}
                                                        disabled={updatingId === t._id}
                                                        title="Approve"
                                                    >
                                                        {updatingId === t._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                                                        onClick={() => handleStatusUpdate(t._id, 'Rejected')}
                                                        disabled={updatingId === t._id}
                                                        title="Reject"
                                                    >
                                                        {updatingId === t._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                                    </Button>
                                                </>
                                            ) : (
                                                <div className="flex items-center">
                                                    <Link href={`/accounts/transactions/${t._id}/voucher`}>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-blue-600 rounded-full" title="Print Voucher">
                                                            <Printer className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-gray-600 rounded-full">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className={`text-right font-bold text-base ${t.type === 'Income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                                        {t.type === 'Income' ? '+' : ''} ₹ {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </TableCell>
                                </motion.tr>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer Pagination */}
            <div className="p-4 border-t border-gray-100/50 bg-background/30 flex items-center justify-between text-xs text-muted-foreground">
                <p>Showing {transactions.length} entries</p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Previous</Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Next</Button>
                </div>
            </div>
        </div>
    );
}

