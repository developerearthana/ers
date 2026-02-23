"use client";

import { useEffect, useState } from 'react';
import { Search, Filter, Eye, Download, Printer, PackageCheck, Loader2, Plus } from 'lucide-react';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getOrders, createOrder } from '@/app/actions/sales';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Order {
    _id: string;
    orderId: string;
    client: string;
    date: string;
    amount: number;
    status: 'New' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    paymentStatus: 'Paid' | 'Pending' | 'Overdue';
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        client: '',
        amount: '',
        status: 'New',
        paymentStatus: 'Pending',
        date: new Date().toISOString().split('T')[0] // Default today
    });

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await getOrders();
                if (res.success && res.data) {
                    setOrders(res.data);
                } else {
                    toast.error("Failed to fetch orders");
                }
            } catch (error) {
                toast.error("Error loading orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                amount: parseFloat(formData.amount) || 0,
            };
            const res = await createOrder(payload);
            if (res.success) {
                toast.success("Order created successfully");
                setIsModalOpen(false);
                setFormData({ client: '', amount: '', status: 'New', paymentStatus: 'Pending', date: new Date().toISOString().split('T')[0] });
                // Reflexive update (or refetch)
                const fetchOrders = async () => {
                    const res = await getOrders();
                    if (res.success) setOrders(res.data);
                };
                fetchOrders();
            } else {
                toast.error("Failed to create order: " + res.error);
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
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Orders</h1>
                    <p className="text-muted-foreground mt-1">Track and manage customer orders and fulfillment.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Printer className="w-4 h-4" /> Print
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" /> Export
                    </Button>
                    <Button className="shadow-lg shadow-primary/20" onClick={() => setIsModalOpen(true)}>
                        <PackageCheck className="w-4 h-4 mr-2" /> New Order
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between border border-white/40 shadow-sm">
                <div className="relative flex-1 w-full md:max-w-md group">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white/50 focus:bg-white transition-all text-sm"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select aria-label="Status Filter" className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 focus:outline-none bg-white hover:bg-background cursor-pointer">
                        <option>All Statuses</option>
                        <option>New</option>
                        <option>Processing</option>
                        <option>Shipped</option>
                        <option>Delivered</option>
                    </select>
                </div>
            </div>

            <div className="glass-card rounded-xl overflow-hidden border border-white/40 shadow-xl bg-white/40 backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Order ID</th>
                                <th className="px-6 py-4 font-semibold">Client</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Payment</th>
                                <th className="px-6 py-4 text-right font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-muted-foreground">No orders found.</td>
                                </tr>
                            ) : (
                                <AnimatePresence mode='popLayout'>
                                    {orders.map((order, index) => (
                                        <motion.tr
                                            key={order._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2, delay: index * 0.05 }}
                                            className="hover:bg-white/60 transition-colors group cursor-pointer"
                                        >
                                            <td className="px-6 py-4 font-medium text-primary">{order.orderId}</td>
                                            <td className="px-6 py-4 text-gray-700 font-medium">{order.client}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{new Date(order.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-bold text-gray-900">₹ {(order.amount || 0).toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border",
                                                    order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        order.status === 'Shipped' ? 'bg-white text-blue-700 border-border' :
                                                            order.status === 'Processing' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                                'bg-background text-gray-700 border-gray-100'
                                                )}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium",
                                                    order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                                                )}>
                                                    <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", order.paymentStatus === 'Paid' ? 'bg-emerald-600' : 'bg-amber-600')}></span>
                                                    {order.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-primary hover:bg-white rounded-full transition-all">
                                                    <Eye className="w-4 h-4" />
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

            {/* Create Order Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Order</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateOrder} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="client">Client Name *</Label>
                            <Input id="client" required value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} placeholder="Client/Company Name" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Total Amount (₹) *</Label>
                                <Input id="amount" type="number" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Order Date</Label>
                                <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Order Status</Label>
                                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="New">New</SelectItem>
                                        <SelectItem value="Processing">Processing</SelectItem>
                                        <SelectItem value="Shipped">Shipped</SelectItem>
                                        <SelectItem value="Delivered">Delivered</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="paymentStatus">Payment Status</Label>
                                <Select value={formData.paymentStatus} onValueChange={(v) => setFormData({ ...formData, paymentStatus: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Paid">Paid</SelectItem>
                                        <SelectItem value="Overdue">Overdue</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Create Order
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </PageWrapper>
    );
}
