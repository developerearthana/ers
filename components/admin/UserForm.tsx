"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PermissionMatrix } from "@/components/admin/PermissionMatrix";
import { Check, Shield, Loader2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { updateUser, getUsers } from "@/app/actions/hrm"; // We might need a createUser action if not exists, reusing updateUser for now or checking actions

interface User {
    id?: string;
    name: string;
    email: string;
    role: string;
    status: 'Active' | 'Inactive';
    dept: string;
    team?: string;
    customRole?: string;
    customPermissions?: string[];
}

interface UserFormProps {
    initialData?: User;
    isEditing?: boolean;
    initialRole?: string;
}

// Map global templates for description lookup if needed, but we rely on simple keys mostly
const ROLE_DESCRIPTIONS: { [key: string]: string } = {
    'admin': "Full administrative access to specific modules.",
    'manager': "Team and Department management capabilities.",
    'staff': "Standard employee access.",
    'vendor': "External vendor portal access.",
    'customer': "Client portal access."
};

export function UserForm({ initialData, isEditing = false, initialRole }: UserFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [activeTab, setActiveTab] = useState('Details');
    const [formData, setFormData] = useState<User>(initialData || {
        name: '',
        email: '',
        role: initialRole || 'staff',
        status: 'Active',
        dept: 'General',
        customPermissions: []
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isEditing) {
            toast.error("Creation not implemented in this demo. Please use Edit.");
            // Ideally we'd have a createUser action. 
            // For now, let's assume we are just updating or strict role management
            return;
        }

        if (!formData.id) return;

        startTransition(async () => {
            const res = await updateUser({
                id: formData.id!,
                name: formData.name,
                email: formData.email,
                role: formData.role,
                dept: formData.team || formData.dept, // normalize
                status: formData.status,
                customPermissions: formData.customPermissions
            });

            if (res.success) {
                toast.success("User saved successfully");
                router.push('/admin/users');
                router.refresh();
            } else {
                toast.error(res.error || "Failed to save user");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white rounded-lg text-gray-500 transition-colors"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditing ? `Edit User Type: ${initialData?.name}` : 'Create New User Type'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {isEditing ? 'Manage user type details, role, and specific permissions.' : 'Add a new user type to the system.'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-background"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 shadow-md shadow-primary/20"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Navigation & Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <nav className="flex flex-col">
                            {['Details', 'Permissions'].map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    className={`
                                        flex items-center justify-between px-6 py-4 text-sm font-medium border-l-4 transition-colors
                                        ${activeTab === tab
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-transparent text-gray-600 hover:bg-background hover:text-gray-900'}
                                    `}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-border">
                        <h4 className="text-sm font-bold text-blue-900 mb-2">Selected Role</h4>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-bold text-blue-700 uppercase">{formData.role}</span>
                        </div>
                        <p className="text-xs text-blue-600 leading-relaxed">
                            {ROLE_DESCRIPTIONS[formData.role] || "Custom role configuration."}
                        </p>
                    </div>
                </div>

                {/* Right Column: Content */}
                <div className="lg:col-span-2 space-y-6">

                    {/* DETAILS TAB */}
                    <div className={activeTab === 'Details' ? 'space-y-6' : 'hidden'}>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-4">Basic Information</h3>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="col-span-2">
                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        required
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="dept" className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                                    <select
                                        id="dept"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                                        value={formData.team || formData.dept}
                                        onChange={e => setFormData({ ...formData, team: e.target.value })}
                                    >
                                        <option>General</option>
                                        <option>IT</option>
                                        <option>Sales</option>
                                        <option>HR</option>
                                        <option>Management</option>
                                        <option>Operations</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1.5">Role Template</label>
                                    <select
                                        id="role"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white uppercase"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        {Object.keys(ROLE_DESCRIPTIONS).map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-4">Account Status</h3>
                            <div className="flex gap-4">
                                <label className={`
                                    flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                                    ${formData.status === 'Active'
                                        ? 'border-green-500 bg-white/20'
                                        : 'border-gray-200 hover:border-green-200 hover:bg-white/10'}
                                `}>
                                    <div className={`
                                        w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                        ${formData.status === 'Active' ? 'border-green-600' : 'border-gray-300'}
                                    `}>
                                        {formData.status === 'Active' && <div className="w-2.5 h-2.5 bg-green-600 rounded-full" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={formData.status === 'Active'}
                                        onChange={() => setFormData({ ...formData, status: 'Active' })}
                                        className="hidden"
                                    />
                                    <div>
                                        <span className="block text-sm font-bold text-gray-900">Active</span>
                                        <span className="text-xs text-gray-500">User can log in</span>
                                    </div>
                                </label>

                                <label className={`
                                    flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                                    ${formData.status === 'Inactive'
                                        ? 'border-red-500 bg-red-50/20'
                                        : 'border-gray-200 hover:border-red-200 hover:bg-red-50/10'}
                                `}>
                                    <div className={`
                                        w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                        ${formData.status === 'Inactive' ? 'border-red-600' : 'border-gray-300'}
                                    `}>
                                        {formData.status === 'Inactive' && <div className="w-2.5 h-2.5 bg-red-600 rounded-full" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={formData.status === 'Inactive'}
                                        onChange={() => setFormData({ ...formData, status: 'Inactive' })}
                                        className="hidden"
                                    />
                                    <div>
                                        <span className="block text-sm font-bold text-gray-900">Inactive</span>
                                        <span className="text-xs text-gray-500">Access disabled</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* PERMISSIONS TAB */}
                    <div className={activeTab === 'Permissions' ? 'space-y-6' : 'hidden'}>
                        <div className="bg-amber-50 p-5 rounded-xl border border-amber-100 flex items-start gap-3">
                            <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-amber-900">Permission Micro-Tuning</h4>
                                <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                                    Grant additional permissions specific to this user. These are <strong>additive</strong> to the permissions inherited from the {formData.role} role. You cannot revoke role-based permissions here, only expand them.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6">
                            <PermissionMatrix
                                selectedPermissions={formData.customPermissions || []}
                                onToggle={(perms) => setFormData({ ...formData, customPermissions: perms })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

