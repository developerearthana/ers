"use client";

import { useEffect, useState } from 'react';
import { Search, Filter, Download, Plus, Loader2, Printer } from 'lucide-react';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getInvoices, createInvoice } from '@/app/actions/sales';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Invoice {
    _id: string;
    invoiceId: string;
    client: string;
    issueDate: string;
    dueDate: string;
    amount: number;
    status: 'Paid' | 'Unpaid' | 'Overdue';
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        client: '',
        amount: '',
        status: 'Unpaid',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: ''
    });

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await getInvoices();
                if (res.success && res.data) {
                    setInvoices(res.data);
                } else {
                    toast.error("Failed to fetch invoices");
                }
            } catch (error) {
                toast.error("Error loading invoices");
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                amount: parseFloat(formData.amount) || 0,
            };
            const res = await createInvoice(payload);
            if (res.success) {
                toast.success("Invoice created successfully");
                setIsModalOpen(false);
                setFormData({ client: '', amount: '', status: 'Unpaid', issueDate: new Date().toISOString().split('T')[0], dueDate: '' });
                // Reflexive update (or refetch)
                const fetchInvoices = async () => {
                    const res = await getInvoices();
                    if (res.success) setInvoices(res.data);
                };
                fetchInvoices();
            } else {
                toast.error("Failed to create invoice: " + res.error);
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <PageWrapper className="space-y-6 max-w-7xl mx-auto p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground mt-1">Manage billing and payments.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Printer className="w-4 h-4" /> Print
                    </Button>
                    <Button className="shadow-lg shadow-primary/20" onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Invoice
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between border border-white/40 shadow-sm">
                <div className="relative flex-1 w-full md:max-w-md group">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white/50 focus:bg-white transition-all text-sm"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="gap-2 text-gray-600">
                        <Filter className="w-4 h-4" />
                        Status
                    </Button>
                </div>
            </div>

            <div className="glass-card rounded-xl overflow-hidden border border-white/40 shadow-xl bg-white/40 backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Invoice ID</th>
                                <th className="px-6 py-4 font-semibold">Client</th>
                                <th className="px-6 py-4 font-semibold">Issue Date</th>
                                <th className="px-6 py-4 font-semibold">Due Date</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 text-right font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50">
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-muted-foreground">No invoices found.</td>
                                </tr>
                            ) : (
                                <AnimatePresence mode='popLayout'>
                                    {invoices.map((inv, index) => (
                                        <motion.tr
                                            key={inv._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2, delay: index * 0.05 }}
                                            className="hover:bg-white/60 transition-colors group cursor-pointer"
                                        >
                                            <td className="px-6 py-4 font-medium text-primary">{inv.invoiceId}</td>
                                            <td className="px-6 py-4 text-gray-700 font-medium">{inv.client}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{new Date(inv.issueDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{new Date(inv.dueDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-bold text-gray-900">₹ {(inv.amount || 0).toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border",
                                                    inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        inv.status === 'Overdue' ? 'bg-red-50 text-red-700 border-red-100' :
                                                            'bg-amber-50 text-amber-700 border-amber-100'
                                                )}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-primary hover:bg-white rounded-full transition-all">
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Invoice Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create Invoice</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateInvoice} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="client">Client Name *</Label>
                            <Input id="client" required value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} placeholder="Client/Company Name" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount (₹) *</Label>
                                <Input id="amount" type="number" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                                        <SelectItem value="Paid">Paid</SelectItem>
                                        <SelectItem value="Overdue">Overdue</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="issueDate">Issue Date</Label>
                                <Input id="issueDate" type="date" required value={formData.issueDate} onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Due Date *</Label>
                                <Input id="dueDate" type="date" required value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Create Invoice
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </PageWrapper>
    );
}
