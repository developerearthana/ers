"use client";

import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { getCompany, updateCompany } from '@/app/actions/organization';
import { toast } from '@/components/ui/toaster';
import { ImageUpload } from '@/components/ui/image-upload';

export default function CompanyMaster() {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        contactNumber: '',
        registrationNumber: '',
        website: '',
        logo: '',
        fullLogo: '',
        iconLogo: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const data = await getCompany();
            if (data) {
                setFormData({
                    name: data.name || '',
                    address: data.address || '',
                    contactNumber: data.contactNumber || '',
                    registrationNumber: data.registrationNumber || '',
                    website: data.website || '',
                    logo: data.logo || '',
                    fullLogo: data.fullLogo || '',
                    iconLogo: data.iconLogo || ''
                });
            }
        };
        loadData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setLoading(true);
        const res = await updateCompany(formData);
        if (res?.data?.success) {
            toast.success("Company settings saved!");
        } else {
            toast.error(res?.data?.error || "Failed to save");
        }
        setLoading(false);
    };

    return (
        <div className="glass-card rounded-xl p-6 md:p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8 border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
                    <p className="text-sm text-gray-500">Manage top-level organizational details.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-md shadow-green-200 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Logo Section */}
                <div className="col-span-1 flex flex-col items-center gap-6">
                    <ImageUpload
                        value={formData.logo}
                        onChange={(url) => setFormData(prev => ({ ...prev, logo: url }))}
                        label="Standard Logo"
                        className="mb-2"
                    />

                    <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="flex flex-col items-center">
                            <ImageUpload
                                value={formData.fullLogo}
                                onChange={(url) => setFormData(prev => ({ ...prev, fullLogo: url }))}
                                label="Full Logo"
                                variant="square"
                                className="w-full h-24"
                            />
                            <span className="text-[10px] text-gray-400 mt-1">Full Brand Logo</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <ImageUpload
                                value={formData.iconLogo}
                                onChange={(url) => setFormData(prev => ({ ...prev, iconLogo: url }))}
                                label="Icon"
                                variant="square"
                                className="w-full h-24"
                            />
                            <span className="text-[10px] text-gray-400 mt-1">Dash/Nav Icon</span>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="col-span-1 md:col-span-2 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name</label>
                        <input
                            type="text"
                            name="name"
                            aria-label="Company Name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Registration / Tax ID</label>
                            <input
                                type="text"
                                name="registrationNumber"
                                aria-label="Registration"
                                value={formData.registrationNumber}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label>
                            <input
                                type="text"
                                name="contactNumber"
                                aria-label="Contact Number"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Registered Address</label>
                        <textarea
                            name="address"
                            aria-label="Registered Address"
                            rows={3}
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Website URL</label>
                        <input
                            type="text"
                            name="website"
                            aria-label="Website URL"
                            value={formData.website}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-blue-600"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
