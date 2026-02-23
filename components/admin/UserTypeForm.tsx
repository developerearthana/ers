"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PermissionMatrix } from "@/components/admin/PermissionMatrix";
import { ArrowLeft, Save, Loader2, ShieldCheck, Copy } from "lucide-react";
import { toast } from "sonner";
import { createRole, updateRole } from "@/app/actions/role";
import { ROLE_TEMPLATES } from "@/lib/permissions";

interface Role {
    _id?: string;
    id?: string; // Handle both id formats
    name: string;
    description: string;
    permissions: string[];
}

interface UserTypeFormProps {
    initialData?: Role;
    isEditing?: boolean;
}

export function UserTypeForm({ initialData, isEditing = false }: UserTypeFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState<Role>(initialData || {
        name: '',
        description: '',
        permissions: []
    });

    const [inheritFrom, setInheritFrom] = useState<string>('');

    const handleInheritance = (templateKey: string) => {
        setInheritFrom(templateKey);
        if (templateKey && ROLE_TEMPLATES[templateKey]) {
            setFormData(prev => ({
                ...prev,
                permissions: [...ROLE_TEMPLATES[templateKey].permissions] // Deep copy permissions
            }));
            toast.info(`Permissions inherited from ${ROLE_TEMPLATES[templateKey].label}`);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('description', formData.description);
        formData.permissions.forEach(p => formDataToSend.append('permissions', p));

        startTransition(async () => {
            let res;
            if (isEditing && (formData._id || formData.id)) {
                res = await updateRole(formData._id || formData.id!, formDataToSend);
            } else {
                res = await createRole(formDataToSend);
            }

            if (res?.error) {
                toast.error(res.error);
            } else {
                toast.success(isEditing ? "User Type updated successfully" : "User Type created successfully");
                router.push('/masters/usertypes');
                router.refresh();
            }
        });
    };

    const isSuperAdmin = formData.name === 'Super Administrator';

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
                            {isEditing ? 'Modify permissions and details for this user type.' : 'Define a new user type and its access levels.'}
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
                    {!isSuperAdmin && (
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 shadow-md shadow-primary/20"
                        >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Type
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-4">General Information</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Type Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    disabled={isSuperAdmin}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:bg-white disabled:text-gray-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Project Manager"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                                <textarea
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[100px]"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the responsibilities and access level..."
                                />
                            </div>
                        </div>
                    </div>

                    {!isEditing && (
                        <div className="bg-white p-6 rounded-xl border border-border space-y-4">
                            <div className="flex items-center gap-2 text-blue-800 font-semibold border-b border-blue-200 pb-2">
                                <Copy className="w-4 h-4" />
                                <h3>Inheritance</h3>
                            </div>
                            <p className="text-xs text-blue-600">
                                Quickly setup permissions by inheriting from a base template.
                            </p>
                            <div>
                                <label className="block text-xs font-medium text-blue-800 mb-1.5">Inherit From</label>
                                <select
                                    className="w-full p-2 border border-blue-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500/20"
                                    value={inheritFrom}
                                    onChange={(e) => handleInheritance(e.target.value)}
                                    aria-label="Inherit permissions from template"
                                >
                                    <option value="">-- Select Base Type --</option>
                                    {Object.entries(ROLE_TEMPLATES).map(([key, tpl]) => (
                                        <option key={key} value={key}>{tpl.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Permissions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-gray-100 bg-background/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                    Access Control Matrix
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Define granular permissions for this user type.
                                </p>
                            </div>
                            <div className="text-xs bg-white px-3 py-1 rounded-full text-gray-600 font-medium">
                                {formData.permissions.length} Permissions Selected
                            </div>
                        </div>

                        <div className="p-6">
                            <PermissionMatrix
                                selectedPermissions={formData.permissions}
                                onToggle={(perms) => setFormData({ ...formData, permissions: perms })}
                                readOnly={isSuperAdmin} // Super Admin has all permissions implicitly or explicitly
                            />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

