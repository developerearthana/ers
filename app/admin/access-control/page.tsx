"use client";

import { useState, useEffect } from 'react';
import { Shield, Users, Check, X, ChevronDown, ChevronRight, Search, Loader2, Save, ShieldCheck, RotateCcw } from 'lucide-react';
import { getModuleAccessData, updateUserModuleAccess, assignUserRole } from '@/app/actions/access-control';
import { MODULE_GROUPS, ACTIONS } from '@/lib/permissions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    dept: string;
    status: string;
    permissions?: string[];
}

interface Role {
    _id: string;
    name: string;
    permissions: string[];
    description: string;
}

const ROLE_COLORS: Record<string, string> = {
    'super-admin': 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    manager: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    staff: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    user: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

const SYSTEM_ROLES = ['super-admin', 'admin', 'manager', 'staff', 'user', 'vendor', 'customer'];

export default function AccessControlPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<Set<string>>(new Set());
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Core Modules']));
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await getModuleAccessData();
        setUsers(data.users);
        setRoles(data.roles);
        setLoading(false);
    };

    const selectUser = (user: User) => {
        setSelectedUser(user);
        // If user is super-admin, give all perms visually
        if (user.role === 'super-admin') {
            const allPerms = new Set<string>();
            MODULE_GROUPS.forEach(g => g.modules.forEach(m => {
                ACTIONS.forEach(a => allPerms.add(a.code === 'view' ? m.code : `${m.code}.${a.code}`));
            }));
            setPermissions(allPerms);
        } else {
            setPermissions(new Set(user.permissions || []));
        }
    };

    const togglePermission = (perm: string) => {
        setPermissions(prev => {
            const n = new Set(prev);
            n.has(perm) ? n.delete(perm) : n.add(perm);
            return n;
        });
    };

    const toggleModuleAll = (moduleCode: string) => {
        const allPerms = ACTIONS.map(a => a.code === 'view' ? moduleCode : `${moduleCode}.${a.code}`);
        const hasAll = allPerms.every(p => permissions.has(p));
        setPermissions(prev => {
            const n = new Set(prev);
            if (hasAll) {
                allPerms.forEach(p => n.delete(p));
            } else {
                allPerms.forEach(p => n.add(p));
            }
            return n;
        });
    };

    const applyRoleTemplate = async (role: string) => {
        if (!selectedUser) return;
        setSaving(true);
        const res = await assignUserRole(selectedUser._id, role);
        if (res.success) {
            // Also find role template permissions from DB roles
            const roleData = roles.find(r => r.name.toLowerCase().replace(/\s/g, '_') === role || r.name.toLowerCase().includes(role.replace('-', ' ')));
            if (roleData) {
                setPermissions(new Set(roleData.permissions));
                await updateUserModuleAccess(selectedUser._id, roleData.permissions);
            }
            setSelectedUser({ ...selectedUser, role });
            setUsers(users.map(u => u._id === selectedUser._id ? { ...u, role } : u));
            toast.success(`Role updated to "${role}"`);
            loadData();
        } else {
            toast.error('Failed to update role');
        }
        setSaving(false);
    };

    const savePermissions = async () => {
        if (!selectedUser) return;
        setSaving(true);
        const permsArray = Array.from(permissions);
        const res = await updateUserModuleAccess(selectedUser._id, permsArray);
        if (res.success) {
            toast.success(`Permissions saved for ${selectedUser.name}`);
            setUsers(users.map(u => u._id === selectedUser._id ? { ...u, permissions: permsArray } : u));
        } else {
            toast.error('Failed to save permissions');
        }
        setSaving(false);
    };

    const filteredUsers = users.filter(u => {
        const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'All' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const getPermKey = (moduleCode: string, actionCode: string) =>
        actionCode === 'view' ? moduleCode : `${moduleCode}.${actionCode}`;

    const toggleGroup = (cat: string) => {
        setExpandedGroups(prev => {
            const n = new Set(prev);
            n.has(cat) ? n.delete(cat) : n.add(cat);
            return n;
        });
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-2">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        Module Access Control
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Control which modules and features each user can access.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
                {/* User List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="glass-card rounded-2xl border border-border overflow-hidden bg-card shadow-sm">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="w-4 h-4 text-primary" />
                                <h2 className="font-semibold text-foreground">Users ({filteredUsers.length})</h2>
                            </div>
                            <div className="relative mb-2">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <select
                                value={roleFilter}
                                onChange={e => setRoleFilter(e.target.value)}
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none"
                                aria-label="Filter by role"
                            >
                                <option value="All">All Roles</option>
                                {SYSTEM_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>

                        <div className="divide-y divide-border max-h-[calc(100vh-370px)] overflow-y-auto">
                            {filteredUsers.map(user => {
                                const isSelected = selectedUser?._id === user._id;
                                const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                                return (
                                    <button
                                        key={user._id}
                                        onClick={() => selectUser(user)}
                                        className={cn(
                                            'w-full px-4 py-3 text-left flex items-center gap-3 transition-colors hover:bg-muted/30',
                                            isSelected && 'bg-primary/5 border-r-2 border-primary'
                                        )}
                                    >
                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                            {initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-foreground truncate">{user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                        <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold shrink-0', ROLE_COLORS[user.role] || ROLE_COLORS.user)}>
                                            {user.role}
                                        </span>
                                    </button>
                                );
                            })}
                            {filteredUsers.length === 0 && (
                                <p className="px-4 py-8 text-center text-muted-foreground text-sm">No users found</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Permission Matrix */}
                <div className="lg:col-span-3">
                    {selectedUser ? (
                        <div className="space-y-4">
                            {/* User Info + Quick Role */}
                            <div className="glass-card rounded-2xl border border-border p-5 bg-card shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                            {selectedUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground">{selectedUser.name}</h3>
                                            <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs text-muted-foreground font-medium">Quick Role:</span>
                                        {SYSTEM_ROLES.slice(0, 5).map(role => (
                                            <button
                                                key={role}
                                                onClick={() => applyRoleTemplate(role)}
                                                disabled={saving}
                                                className={cn(
                                                    'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all',
                                                    selectedUser.role === role
                                                        ? 'bg-primary text-primary-foreground border-primary'
                                                        : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-primary'
                                                )}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedUser.role === 'super-admin' && (
                                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                                        <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Super Admin has unrestricted access to all modules. Permissions cannot be restricted.</p>
                                    </div>
                                )}
                            </div>

                            {/* Module Permission Grid */}
                            <div className="glass-card rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
                                    <h3 className="font-semibold text-foreground">Module Permissions</h3>
                                    <div className="flex gap-2">
                                        {/* Legend */}
                                        <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                                            {ACTIONS.map(a => (
                                                <span key={a.code} title={a.description} className="font-medium">{a.label.split(' ')[0]}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="divide-y divide-border max-h-[calc(100vh-420px)] overflow-y-auto">
                                    {MODULE_GROUPS.map(group => (
                                        <div key={group.category}>
                                            <button
                                                onClick={() => toggleGroup(group.category)}
                                                className="w-full px-5 py-3 flex items-center justify-between bg-muted/20 hover:bg-muted/40 transition-colors"
                                            >
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{group.category}</span>
                                                {expandedGroups.has(group.category)
                                                    ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                    : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                }
                                            </button>

                                            {expandedGroups.has(group.category) && group.modules.map(module => {
                                                const allPerms = ACTIONS.map(a => getPermKey(module.code, a.code));
                                                const hasAll = allPerms.every(p => permissions.has(p));
                                                const hasAny = allPerms.some(p => permissions.has(p));

                                                return (
                                                    <div key={module.code} className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/10 transition-colors">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <button
                                                                onClick={() => toggleModuleAll(module.code)}
                                                                disabled={selectedUser.role === 'super-admin'}
                                                                className={cn(
                                                                    'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                                                                    hasAll ? 'bg-primary border-primary' : hasAny ? 'bg-primary/30 border-primary' : 'border-border bg-background'
                                                                )}
                                                                title={`Toggle all ${module.label} permissions`}
                                                            >
                                                                {hasAll && <Check className="w-2.5 h-2.5 text-white" />}
                                                                {hasAny && !hasAll && <div className="w-2 h-0.5 bg-primary rounded" />}
                                                            </button>
                                                            <span className="text-sm font-medium text-foreground truncate">{module.label}</span>
                                                            <code className="text-[10px] text-muted-foreground hidden sm:block">{module.code}</code>
                                                        </div>

                                                        <div className="flex items-center gap-2 shrink-0">
                                                            {ACTIONS.map(action => {
                                                                const permKey = getPermKey(module.code, action.code);
                                                                const hasIt = selectedUser.role === 'super-admin' || permissions.has(permKey);
                                                                return (
                                                                    <button
                                                                        key={action.code}
                                                                        title={`${action.label} – ${module.label}`}
                                                                        onClick={() => togglePermission(permKey)}
                                                                        disabled={selectedUser.role === 'super-admin'}
                                                                        className={cn(
                                                                            'w-8 h-8 rounded-lg flex items-center justify-center transition-all border text-xs font-bold',
                                                                            hasIt
                                                                                ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary hover:text-white'
                                                                                : 'bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-primary/50',
                                                                            'disabled:opacity-60 disabled:cursor-not-allowed'
                                                                        )}
                                                                    >
                                                                        {hasIt ? action.code[0].toUpperCase() : <X className="w-3 h-3" />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="px-5 py-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                        {ACTIONS.map(a => (
                                            <span key={a.code} className="flex items-center gap-1">
                                                <span className="w-5 h-5 rounded bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">{a.code[0].toUpperCase()}</span>
                                                = {a.label}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => selectUser(selectedUser)}
                                            className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" /> Reset
                                        </button>
                                        <button
                                            onClick={savePermissions}
                                            disabled={saving || selectedUser.role === 'super-admin'}
                                            className="flex items-center gap-1.5 px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 disabled:opacity-60"
                                        >
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Save Permissions
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card rounded-2xl border border-dashed border-border bg-card/50 flex flex-col items-center justify-center py-24 text-center px-8">
                            <ShieldCheck className="w-16 h-16 text-muted-foreground/20 mb-4" />
                            <h3 className="font-semibold text-foreground">Select a User</h3>
                            <p className="text-sm text-muted-foreground mt-2 max-w-xs">Choose a user from the left panel to configure their module access and permissions.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
