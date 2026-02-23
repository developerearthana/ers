"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createContact, updateContact } from '@/app/actions/contacts';
import { getMasters } from '@/app/actions/masters';
import { toast } from 'sonner';

interface ContactFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export default function ContactForm({ initialData, isEdit = false }: ContactFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultType = searchParams.get('type') || 'Client';

    const [isLoading, setIsLoading] = useState(false);
    const [fetchingMasters, setFetchingMasters] = useState(true);

    // Masters Data
    const [contactTypes, setContactTypes] = useState<any[]>([]);
    const [vendorCategories, setVendorCategories] = useState<any[]>([]);

    // State
    const [contactType, setContactType] = useState<string>('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMasters = async () => {
            try {
                const [typesRes, catsRes] = await Promise.all([
                    getMasters('ContactType'),
                    getMasters('VendorCategory')
                ]);

                if (typesRes.success) setContactTypes(typesRes.data);
                if (catsRes.success) setVendorCategories(catsRes.data);

                // Set initial type after fetching
                const validTypes = typesRes.success ? typesRes.data.map((t: any) => t.value) : [];
                const typeToUse = isEdit && initialData?.type
                    ? initialData.type
                    : (validTypes.includes(defaultType) ? defaultType : (validTypes[0] || 'Client'));

                setContactType(typeToUse);

            } catch (e) {
                console.error("Failed to load masters", e);
                toast.error("Failed to load options");
            } finally {
                setFetchingMasters(false);
            }
        };

        fetchMasters();
    }, [defaultType, isEdit, initialData]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            company: formData.get('company') as string,
            phone: formData.get('phone') as string,
            type: contactType as any,
            address: (formData.get('address') as string) || undefined,
            category: (formData.get('category') as string) || undefined,
            notes: (formData.get('notes') as string) || undefined,
            status: initialData?.status || 'Active',
        };

        try {
            let res;
            if (isEdit && initialData?._id) { // Use _id from prop if available, or id if sanitized
                // Handle both id formats for safety
                const idToUse = initialData.id || initialData._id;
                res = await updateContact({ id: idToUse, ...data });
            } else {
                res = await createContact(data);
            }

            if (res.success) {
                toast.success(isEdit ? 'Contact updated successfully' : 'Contact created successfully');
                router.push('/contacts');
                router.refresh();
            } else {
                setError(res.error || (isEdit ? 'Failed to update contact' : 'Failed to create contact'));
                toast.error(res.error || (isEdit ? 'Failed to update contact' : 'Failed to create contact'));
            }
        } catch (err) {
            setError('An unexpected error occurred');
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (fetchingMasters) {
        return (
            <div className="glass-card p-6 rounded-xl flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-xl space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Basic Details</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Type</label>
                        <select
                            aria-label="Contact Type"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                            value={contactType}
                            onChange={(e) => setContactType(e.target.value)}
                        >
                            {contactTypes.map((type) => (
                                <option key={type._id} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input name="name" defaultValue={initialData?.name} required type="text" placeholder="e.g. Rajesh Kumar" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        <input name="company" defaultValue={initialData?.company} required type="text" placeholder="e.g. TechFlow Solutions" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>

                    {contactType === 'Vendor' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Category</label>
                            <select name="category" defaultValue={initialData?.category} aria-label="Vendor Category" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white">
                                <option value="">Select Category</option>
                                {vendorCategories.map((cat) => (
                                    <option key={cat._id} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input name="email" defaultValue={initialData?.email} required type="email" placeholder="rajesh@example.com" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input name="phone" defaultValue={initialData?.phone} required type="tel" placeholder="+91 98765 43210" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input name="address" defaultValue={initialData?.location || initialData?.address} type="text" placeholder="City, State (e.g. Mumbai, MH)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                </div>
            </div>

            {/* Additional Info */}
            <div className="pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea name="notes" defaultValue={initialData?.notes} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Any additional details..."></textarea>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end gap-3 pt-4">
                <Link href="/contacts" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-background rounded-lg border border-gray-200">
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                >
                    <Save className="w-4 h-4" />
                    {isLoading ? 'Saving...' : (isEdit ? 'Update Contact' : 'Save Contact')}
                </button>
            </div>
        </form>
    );
}

