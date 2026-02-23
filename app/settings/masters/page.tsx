"use client";

import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { getMasters, createMaster, updateMaster, deleteMaster } from '@/app/actions/masters';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MASTER_TYPES = [
    { label: "Contact Types", value: "ContactType" },
    { label: "Vendor Categories", value: "VendorCategory" },
    { label: "Lead Statuses", value: "LeadStatus" },
    { label: "Contact Statuses", value: "ContactStatus" },
];

export default function MastersPage() {
    const [selectedType, setSelectedType] = useState(MASTER_TYPES[0].value);
    const [masters, setMasters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ label: '', value: '', order: 0, color: '' });

    useEffect(() => {
        loadMasters();
    }, [selectedType]);

    const loadMasters = async () => {
        setLoading(true);
        try {
            const res = await getMasters(selectedType);
            if (res.success) {
                setMasters(res.data);
            }
        } catch (error) {
            toast.error("Failed to load masters");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                type: selectedType,
                value: formData.value || formData.label, // Default value to label if empty
            };

            let res;
            if (editingId) {
                res = await updateMaster(editingId, payload);
            } else {
                res = await createMaster(payload);
            }

            if (res.success) {
                toast.success(editingId ? "Updated successfully" : "Created successfully");
                setIsDialogOpen(false);
                resetForm();
                loadMasters();
            } else {
                toast.error(res.error || "Operation failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteMaster(id);
            toast.success("Deleted successfully");
            loadMasters();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const resetForm = () => {
        setFormData({ label: '', value: '', order: 0, color: '' });
        setEditingId(null);
    };

    const handleEdit = (master: any) => {
        setFormData({
            label: master.label,
            value: master.value,
            order: master.order,
            color: master.color || ''
        });
        setEditingId(master._id);
        setIsDialogOpen(true);
    };

    return (
        <PageWrapper className="space-y-6 max-w-5xl mx-auto p-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Masters</h1>
                    <p className="text-gray-500">Manage dropdown options and system values.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary text-white hover:bg-primary/90">
                            <Plus className="w-4 h-4 mr-2" />
                            Add New
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Label</Label>
                                <Input required value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} placeholder="e.g. New Status" />
                            </div>
                            <div className="space-y-2">
                                <Label>Value (Optional)</Label>
                                <Input value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} placeholder="e.g. NEW_STATUS" />
                                <p className="text-xs text-muted-foreground">Will match label if left empty.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Order</Label>
                                    <Input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Color Class (Tailwind)</Label>
                                    <Input value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} placeholder="e.g. bg-white text-blue-700" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Type Tabs */}
            <div className="flex gap-2 p-1 bg-white rounded-lg overflow-x-auto">
                {MASTER_TYPES.map(type => (
                    <button
                        key={type.value}
                        onClick={() => setSelectedType(type.value)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${selectedType === type.value
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                            }`}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="glass-card rounded-xl overflow-hidden border border-white/40 shadow-sm bg-white/40">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white/50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Label</th>
                            <th className="px-6 py-4">Value</th>
                            <th className="px-6 py-4">Order</th>
                            <th className="px-6 py-4">Preview</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/50">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                        ) : masters.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No items found.</td></tr>
                        ) : (
                            masters.map((master) => (
                                <tr key={master._id} className="hover:bg-white/60">
                                    <td className="px-6 py-4 font-medium">{master.label}</td>
                                    <td className="px-6 py-4 text-gray-500">{master.value}</td>
                                    <td className="px-6 py-4 text-gray-500">{master.order}</td>
                                    <td className="px-6 py-4">
                                        {master.color && (
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold border ${master.color}`}>
                                                {master.label}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-white" onClick={() => handleEdit(master)}>
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(master._id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </PageWrapper>
    );
}
