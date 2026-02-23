import { getRoles, deleteRole } from '@/app/actions/role';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { Shield, Plus, Edit2, Trash2, Users, Lock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default async function UserTypesPage() {
    const roles = await getRoles();

    // Sort roles: Super Admin first, then others
    const sortedRoles = roles?.sort((a: any, b: any) => {
        if (a.name === 'Super Administrator') return -1;
        if (b.name === 'Super Administrator') return 1;
        return a.name.localeCompare(b.name);
    }) || [];

    return (
        <PageWrapper>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Types</h1>
                    <p className="text-gray-500 mt-1">Define user roles and their system access levels.</p>
                </div>
                <Link href="/masters/usertypes/create" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Add User Type
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sortedRoles.length === 0 ? (
                    <div className="col-span-full p-12 text-center bg-background rounded-xl border border-dashed border-gray-300">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No user types defined yet.</p>
                        <p className="text-sm text-gray-400 mt-1">Create a new user type to get started.</p>
                    </div>
                ) : (
                    sortedRoles.map((role: any) => {
                        const isSuperAdmin = role.name === 'Super Administrator';

                        return (
                            <div key={role._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-2 rounded-lg ${isSuperAdmin ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {isSuperAdmin ? <Lock className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                                    </div>
                                    <span className="text-xs font-mono bg-white px-2 py-1 rounded text-gray-500 font-medium">
                                        {role.permissions.length} perms
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate" title={role.name}>{role.name}</h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-3 min-h-[40px]">
                                    {role.description || "No description provided."}
                                </p>

                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                                    <Link
                                        href={`/masters/usertypes/${role._id}`}
                                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-background rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                        Edit
                                    </Link>

                                    {!isSuperAdmin && (
                                        <form action={async () => {
                                            'use server';
                                            // We need to verify if this is safe with the imports, likely need a client component for delete or a proper server action form
                                            // For simplicity in this demo, invoking server action directly via bind or form action
                                            await deleteRole(role._id);
                                        }}>
                                            <button
                                                type="submit"
                                                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1.5"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Delete
                                            </button>
                                        </form>
                                    )}
                                    {isSuperAdmin && (
                                        <span className="px-3 py-1.5 text-xs font-medium text-gray-400 bg-background rounded-lg flex items-center gap-1.5 cursor-not-allowed">
                                            <Lock className="w-3.5 h-3.5" />
                                            Protected
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </PageWrapper>
    );
}
