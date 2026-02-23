"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { createOrder, getVendors } from '@/app/actions/purchase';

interface CreatePOModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreatePOModal({ isOpen, onClose }: CreatePOModalProps) {
    const [loading, setLoading] = useState(false);
    const [vendors, setVendors] = useState<any[]>([]);
    const [pageStep, setPageStep] = useState(1); // 1: Vendor, 2: Items

    // Form State
    const [selectedVendor, setSelectedVendor] = useState("");
    const [items, setItems] = useState<{ description: string, quantity: number, rate: number, amount: number }[]>([
        { description: "", quantity: 1, rate: 0, amount: 0 }
    ]);
    const [deliveryDate, setDeliveryDate] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (isOpen) {
            loadVendors();
            setPageStep(1);
            setItems([{ description: "", quantity: 1, rate: 0, amount: 0 }]);
            setSelectedVendor("");
            setDeliveryDate("");
            setNotes("");
        }
    }, [isOpen]);

    const loadVendors = async () => {
        const res = await getVendors();
        if (res.success && res.data) {
            setVendors(res.data);
        }
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-calc amount
        if (field === 'quantity' || field === 'rate') {
            newItems[index].amount = newItems[index].quantity * newItems[index].rate;
        }

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { description: "", quantity: 1, rate: 0, amount: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async () => {
        if (!selectedVendor || items.some(i => !i.description || i.quantity <= 0)) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);
        const totalValue = items.reduce((sum, item) => sum + item.amount, 0);

        const res = await createOrder({
            vendor: selectedVendor,
            date: new Date().toISOString(),
            items,
            totalValue,
            status: 'Draft',
            deliveryDate: deliveryDate || undefined,
            notes
        });

        setLoading(false);

        if (res.success) {
            toast.success("Purchase Order Created");
            onClose();
        } else {
            toast.error(res.error || "Failed to create PO");
        }
    };

    const totalOrderValue = items.reduce((sum, item) => sum + item.amount, 0);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create Purchase Order</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Simplified Single Page Form for speed */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Vendor</label>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={selectedVendor}
                                onChange={(e) => setSelectedVendor(e.target.value)}
                                aria-label="Select Vendor"
                            >
                                <option value="">Select Vendor...</option>
                                {vendors.map(v => (
                                    <option key={v._id} value={v.name}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Expected Delivery</label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded-md"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                aria-label="Expected Delivery Date"
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <label className="text-sm font-medium mb-2 block">Order Items</label>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-2 items-start">
                                    <input
                                        placeholder="Item Description"
                                        className="flex-1 p-2 border rounded-md text-sm"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Qty"
                                        className="w-20 p-2 border rounded-md text-sm"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Rate"
                                        className="w-24 p-2 border rounded-md text-sm"
                                        value={item.rate}
                                        onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value))}
                                    />
                                    <div className="w-24 p-2 bg-background rounded-md text-sm font-medium text-right">
                                        ₹{item.amount.toLocaleString()}
                                    </div>
                                    <button
                                        onClick={() => removeItem(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                                        disabled={items.length === 1}
                                        aria-label="Remove Item"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addItem}
                            className="mt-2 text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700"
                        >
                            <Plus className="w-4 h-4" /> Add Item
                        </button>
                    </div>

                    <div className="flex justify-between items-center border-t pt-4">
                        <div>
                            <p className="text-sm text-gray-500">Total Value</p>
                            <p className="text-xl font-bold">₹ {totalOrderValue.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={loading}>
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Create Order
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

