"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Building, MoreVertical, Loader2, Eye, Edit, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from '@/components/ui/toaster';
import { getSubsidiaries, createSubsidiary, updateSubsidiary, deleteSubsidiary } from '@/app/actions/organization';
import { ImageUpload } from '@/components/ui/image-upload';

interface Subsidiary {
    _id?: string;
    id?: string; // handling both for now
    name: string;
    location: string;
    address?: string;
    contactNumber?: string;
    headOfOperation?: string;
    description?: string;
    logo?: string;
}

export default function SubsidiariesMaster() {
    const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isViewOnly, setIsViewOnly] = useState(false);
    const [currentSub, setCurrentSub] = useState<Subsidiary | null>(null);
    const [formData, setFormData] = useState<Subsidiary>({
        name: '',
        location: '',
        address: '',
        contactNumber: '',
        headOfOperation: '',
        description: '',
        logo: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadSubsidiaries();
    }, []);

    const loadSubsidiaries = async () => {
        setLoading(true);
        const data = await getSubsidiaries();
        setSubsidiaries(data || []);
        setLoading(false);
    };

    const handleOpenSheet = (sub?: Subsidiary, viewOnly: boolean = false) => {
        setIsViewOnly(viewOnly);
        if (sub) {
            setCurrentSub(sub);
            setFormData({
                name: sub.name,
                location: sub.location,
                address: sub.address || '',
                contactNumber: sub.contactNumber || '',
                headOfOperation: sub.headOfOperation || '',
                description: sub.description || '',
                logo: sub.logo || ''
            });
        } else {
            setCurrentSub(null);
            setFormData({ name: '', location: '', address: '', contactNumber: '', headOfOperation: '', description: '', logo: '' });
        }
        setIsSheetOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this subsidiary? This action cannot be undone.")) {
            const res = await deleteSubsidiary({ id });
            if (res.success) {
                toast.success("Subsidiary deleted");
                loadSubsidiaries();
            } else {
                toast.error(res.error || "Failed to delete");
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isViewOnly) return;

        setIsSaving(true);

        try {
            let res;
            if (currentSub && (currentSub._id || currentSub.id)) {
                res = await updateSubsidiary({ ...formData, id: currentSub._id || currentSub.id });
            } else {
                res = await createSubsidiary(formData);
            }

            if (res.success) {
                toast.success(currentSub ? "Subsidiary updated" : "Subsidiary created");
                setIsSheetOpen(false);
                loadSubsidiaries();
            } else {
                toast.error(res.error || "Operation failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
        setIsSaving(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Subsidiaries</h1>
                    <p className="text-gray-500">Manage branch offices and legal entities.</p>
                </div>
                <Button onClick={() => handleOpenSheet(undefined, false)} className="bg-primary hover:bg-primary/90 shadow-md shadow-green-200">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Subsidiary
                </Button>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subsidiaries.filter(sub => sub.name !== 'Earthana').length === 0 && <p className="text-center col-span-2 text-gray-500 py-10">No subsidiaries found.</p>}
                    {subsidiaries.filter(sub => sub.name !== 'Earthana').map((sub) => (
                        <div
                            key={sub._id || sub.id}
                            className="bg-white border rounded-xl p-5 hover:border-primary/50 transition-all hover:shadow-md group relative flex flex-col justify-between h-full min-h-[180px]"
                        >
                            <div>
                                <div className="flex flex-col gap-4 mb-4">
                                    <div className="w-full h-40 bg-background rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 p-4">
                                        {sub.logo ? (
                                            <img src={sub.logo} alt={sub.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <Building className="w-12 h-12 text-gray-300" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{sub.name}</h3>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <p className="text-sm text-gray-500 line-clamp-2">{sub.description || 'No description available.'}</p>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 ml-0.5" />
                                            {sub.location}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-medium text-gray-700">Head:</span>
                                            {sub.headOfOperation || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Footer - Replaces the whole-card click */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t mt-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-blue-600 hover:text-blue-700 hover:bg-white"
                                    onClick={() => handleOpenSheet(sub, true)}
                                >
                                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                                    View
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                    onClick={() => handleOpenSheet(sub, false)}
                                >
                                    <Edit className="w-3.5 h-3.5 mr-1.5" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDelete(sub._id || sub.id!)}
                                >
                                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit/Create Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent onOpenAutoFocus={(e) => e.preventDefault()} className="flex flex-col h-full w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>
                            {isViewOnly ? 'Subsidiary Details' : (currentSub ? 'Edit Subsidiary' : 'Add New Subsidiary')}
                        </SheetTitle>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden mt-6">
                        <fieldset disabled={isViewOnly} className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6 space-y-6 group-disabled">
                            <div className="flex justify-center mt-2">
                                        <ImageUpload
                                            value={formData.logo}
                                            onChange={(url) => setFormData(prev => ({ ...prev, logo: url }))}
                                            variant="square"
                                            label="Upload Logo"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Subsidiary Name</Label>
                                        <Input
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Earthana India Pvt Ltd"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Location (City)</Label>
                                            <Input
                                                required
                                                value={formData.location}
                                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                                placeholder="City"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Contact Number</Label>
                                            <Input
                                                value={formData.contactNumber}
                                                onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                                                placeholder="+91..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Full Address</Label>
                                        <Textarea
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Full address of the branch"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Head of Operation</Label>
                                        <Input
                                            value={formData.headOfOperation}
                                            onChange={e => setFormData({ ...formData, headOfOperation: e.target.value })}
                                            placeholder="Full Name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Brief description of activities"
                                        />
                                    </div>
                        </fieldset>

                        <SheetFooter className="py-4 border-t mt-auto">
                            <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
                                {isViewOnly ? 'Close' : 'Cancel'}
                            </Button>
                            {!isViewOnly && (
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Save Changes
                                </Button>
                            )}
                        </SheetFooter>
                    </form >
                </SheetContent >
            </Sheet >
        </div >
    );
}
