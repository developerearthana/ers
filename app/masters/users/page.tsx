"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, LayoutGrid, List, Loader2, Shield, Building2, KeyRound, Edit2, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { toast } from '@/components/ui/toaster';
import { getAllUsers, createUser, updateUser, deleteUser, toggleUserStatus } from '@/app/actions/user';
import { getDepartments } from '@/app/actions/organization';
import { getRoles } from '@/app/actions/role';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PasswordResetModal } from '@/components/admin/PasswordResetModal';
import { useViewPreference } from '@/hooks/useViewPreference';

interface Department {
    _id: string;
    name: string;
}

interface Role {
    _id: string;
    name: string;
    description?: string;
}

interface User {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    role: string;
    dept: string;
    jobTitle?: string;
    image?: string;
    status: 'Active' | 'Inactive' | 'On Leave';
    customRole?: string;
}

export default function UsersMaster() {
    const [users, setUsers] = useState<User[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useViewPreference<'grid' | 'list'>('usersViewMode', 'grid');
    const [roleFilter, setRoleFilter] = useState('All Roles');
    const [statusFilter, setStatusFilter] = useState('All Status');

    // Password Reset State
    const [resetModalOpen, setResetModalOpen] = useState(false);
    const [selectedUserForReset, setSelectedUserForReset] = useState<{ id: string, name: string } | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        dept: 'General',
        jobTitle: '',
        status: 'Active' as const,
        customRole: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [selectedRoleValue, setSelectedRoleValue] = useState<string>('system:user');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [usersData, deptsData, rolesData] = await Promise.all([
            getAllUsers(),
            getDepartments(),
            getRoles()
        ]);
        setUsers(usersData || []);
        setDepartments(deptsData || []);
        setRoles(rolesData || []);
        setLoading(false);
    };

    const toggleViewMode = (mode: 'grid' | 'list') => {
        setViewMode(mode);
    };

    const handleOpenSheet = (user?: User) => {
        if (user) {
            setCurrentUser(user);
            const isCustom = user.customRole && roles.some(r => r._id === user.customRole);
            const initialRoleValue = isCustom ? `custom:${user.customRole}` : `system:${user.role}`;

            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role,
                dept: user.dept || 'General',
                jobTitle: user.jobTitle || '',
                status: user.status as any,
                customRole: user.customRole || ''
            });
            setSelectedRoleValue(initialRoleValue);
        } else {
            setCurrentUser(null);
            setFormData({
                name: '', email: '', password: '', role: 'user', dept: 'General', jobTitle: '', status: 'Active', customRole: ''
            });
            setSelectedRoleValue('system:user');
        }
        setIsSheetOpen(true);
    };

    const handleRoleChange = (val: string) => {
        setSelectedRoleValue(val);
        if (val.startsWith('system:')) {
            const roleName = val.split(':')[1];
            setFormData({ ...formData, role: roleName, customRole: '' });
        } else if (val.startsWith('custom:')) {
            const roleId = val.split(':')[1];
            // When selecting a custom role, we default base role to 'staff' unless it's super-admin like
            // Or typically 'user' or 'staff'. Let's use 'user' as generic base.
            setFormData({ ...formData, role: 'user', customRole: roleId });
        }
    };

    const getRoleLabel = (user: User) => {
        if (user.customRole) {
            const r = roles.find(r => r._id === user.customRole);
            if (r) return r.name;
        }
        return user.role;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let res;
            if (currentUser && (currentUser._id || currentUser.id)) {
                res = await updateUser({ ...formData, id: currentUser._id || currentUser.id });
            } else {
                res = await createUser(formData);
            }

            if (res.success) {
                toast.success(currentUser ? "User updated" : "User created");
                setIsSheetOpen(false);
                loadData();
            } else {
                toast.error(res.error || "Operation failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            const res = await deleteUser({ id });
            if (res.success) {
                toast.success("User deleted");
                loadData();
            } else {
                toast.error(res.error || "Failed to delete");
            }
        }
    };

    const handleStatusToggle = async (user: User) => {
        const userId = user._id || user.id!;
        const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';

        // Optimistic update
        setUsers(prev => prev.map(u => (u._id === userId || u.id === userId) ? { ...u, status: newStatus as any } : u));

        try {
            await toggleUserStatus(userId, user.status);
            toast.success(`User ${newStatus === 'Active' ? 'activated' : 'deactivated'}`);
        } catch (error) {
            loadData(); // Revert
            toast.error("Failed to update status");
        }
    };

    const handlePasswordReset = (user: User) => {
        setSelectedUserForReset({ id: user._id || user.id!, name: user.name });
        setResetModalOpen(true);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'All Roles' || (user.customRole ? getRoleLabel(user) === roleFilter : user.role === roleFilter.toLowerCase().replace(' ', '-'));
        const matchesStatus = statusFilter === 'All Status' || user.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-gray-500">Manage real user accounts access and settings.</p>
                </div>
                <Button onClick={() => handleOpenSheet()} className="bg-primary hover:bg-primary/90 shadow-md shadow-green-200">
                    <Plus className="w-5 h-5 mr-2" />
                    Add User
                </Button>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm items-center">
                <div className="relative flex-1 w-full md:w-auto">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[140px] bg-background">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="All Status">All Status</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="On Leave">On Leave</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center border rounded-lg overflow-hidden shrink-0">
                    <button
                        onClick={() => toggleViewMode('grid')}
                        className={`p-2.5 ${viewMode === 'grid' ? 'bg-white text-gray-900' : 'bg-white text-gray-500 hover:text-gray-900'}`}
                        title="Grid View"
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <div className="w-px h-10 bg-white" />
                    <button
                        onClick={() => toggleViewMode('list')}
                        className={`p-2.5 ${viewMode === 'list' ? 'bg-white text-gray-900' : 'bg-white text-gray-500 hover:text-gray-900'}`}
                        title="List View"
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content View */}
            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
            ) : filteredUsers.length === 0 ? (
                <p className="text-center text-gray-500 py-10 bg-white rounded-xl border border-dashed">No users found.</p>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredUsers.map((user) => (
                                <div key={user._id || user.id} className="bg-white border rounded-lg p-5 hover:shadow-md transition-all group flex flex-col h-full">
                                    <div className="flex items-center gap-4 mb-4">
                                        <Avatar className="w-12 h-12">
                                            <AvatarImage src={user.image} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="overflow-hidden">
                                            <h3 className="font-semibold text-gray-900 truncate" title={user.name}>{user.name}</h3>
                                            <p className="text-xs text-gray-500 truncate" title={user.email}>{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4 flex-grow">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Role</span>
                                            <span className="font-medium capitalize text-primary text-xs bg-primary/5 px-2 py-0.5 rounded-full">{getRoleLabel(user)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Dept</span>
                                            <span className="font-medium truncate max-w-[120px]" title={user.dept}>{user.dept}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm pt-2">
                                            <span className="text-gray-500">Status</span>
                                            <button
                                                onClick={() => handleStatusToggle(user)}
                                                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary ${user.status === 'Active' ? 'bg-white0' : 'bg-white'}`}
                                                role="switch"
                                                aria-checked={user.status === 'Active' ? 'true' : 'false'}
                                                aria-label="Toggle user status"
                                            >
                                                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${user.status === 'Active' ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-3 mt-auto border-t">
                                        <Button
                                            variant="ghost" size="sm"
                                            className="h-7 px-2 text-gray-500 hover:text-gray-700"
                                            onClick={() => handlePasswordReset(user)}
                                            title="Reset Password"
                                        >
                                            <KeyRound className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost" size="sm"
                                            className="h-7 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                            onClick={() => handleOpenSheet(user)}
                                        >
                                            <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                                        </Button>
                                        <Button
                                            variant="ghost" size="sm"
                                            className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDelete(user._id || user.id!)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-background border-b">
                                        <tr>
                                            <th className="px-3 sm:px-6 py-3 font-medium">User</th>
                                            <th className="px-3 sm:px-6 py-3 font-medium hidden sm:table-cell">Role</th>
                                            <th className="px-3 sm:px-6 py-3 font-medium hidden md:table-cell">Department</th>
                                            <th className="px-3 sm:px-6 py-3 font-medium text-center hidden sm:table-cell">Status</th>
                                            <th className="px-3 sm:px-6 py-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredUsers.map((user) => (
                                            <tr key={user._id || user.id} className="hover:bg-background/50">
                                                <td className="px-3 sm:px-6 py-3">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <Avatar className="w-8 h-8 shrink-0">
                                                            <AvatarImage src={user.image} />
                                                            <AvatarFallback className="text-xs bg-white">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-gray-900 truncate text-sm">{user.name}</p>
                                                            <p className="text-xs text-gray-500 truncate hidden sm:block">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 capitalize hidden sm:table-cell">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-800">
                                                        {getRoleLabel(user)}
                                                    </span>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 hidden md:table-cell text-sm">{user.dept}</td>
                                                <td className="px-3 sm:px-6 py-3 text-center hidden sm:table-cell">
                                                    <button
                                                        onClick={() => handleStatusToggle(user)}
                                                        role="switch"
                                                        aria-checked={user.status === 'Active' ? 'true' : 'false'}
                                                        aria-label={`Toggle status for ${user.name}`}
                                                    >
                                                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${user.status === 'Active' ? 'translate-x-4' : 'translate-x-0'}`} />
                                                    </button>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:bg-background rounded-full" onClick={() => handlePasswordReset(user)} title="Reset Password">
                                                            <KeyRound className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:bg-amber-50 rounded-full" onClick={() => handleOpenSheet(user)}>
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-full" onClick={() => handleDelete(user._id || user.id!)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Create/Edit Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{currentUser ? 'Edit User' : 'Add New User'}</SheetTitle>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 mt-6">

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Full Name <span className="text-red-500">*</span></Label>
                                <Input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Email Address <span className="text-red-500">*</span></Label>
                                <Input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Password {currentUser && <span className="text-xs font-normal text-gray-500">(Leave blank to keep current)</span>}</Label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={currentUser ? "********" : "Set Password"}
                                    required={!currentUser}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>User Type / Role</Label>
                                    <Select
                                        value={selectedRoleValue}
                                        onValueChange={handleRoleChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Role" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white max-h-[300px]">
                                            <SelectGroup>
                                                <SelectLabel>System Roles</SelectLabel>
                                                <SelectItem value="system:super-admin">Super Admin (All Access)</SelectItem>
                                                <SelectItem value="system:admin">System Admin</SelectItem>
                                                <SelectItem value="system:manager">Manager</SelectItem>
                                                <SelectItem value="system:staff">Staff</SelectItem>
                                                <SelectItem value="system:vendor">Vendor</SelectItem>
                                            </SelectGroup>
                                            {roles.length > 0 && (
                                                <SelectGroup>
                                                    <SelectLabel>Custom User Types</SelectLabel>
                                                    {roles.map(role => (
                                                        <SelectItem key={role._id} value={`custom:${role._id}`}>
                                                            {role.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                            <SelectItem value="On Leave">On Leave</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Department</Label>
                                <Select
                                    value={formData.dept}
                                    onValueChange={(val) => setFormData({ ...formData, dept: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="General">General</SelectItem>
                                        {departments.map(d => (
                                            <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Job Title</Label>
                                <Input
                                    value={formData.jobTitle}
                                    onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                                    placeholder="e.g. Senior Developer"
                                />
                            </div>
                        </div>

                        <SheetFooter>
                            <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Save {currentUser ? 'User Type' : 'New User Type'}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Password Reset Modal */}
            {selectedUserForReset && (
                <PasswordResetModal
                    isOpen={resetModalOpen}
                    onClose={() => { setResetModalOpen(false); setSelectedUserForReset(null); }}
                    userId={selectedUserForReset.id}
                    userName={selectedUserForReset.name}
                />
            )}
        </div>
    );
}
