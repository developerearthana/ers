"use client";

import { useState, useEffect } from 'react';
import { Shield, Users, Check, X, Search, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { getModuleAccessData } from '@/app/actions/access-control';
import { MODULE_GROUPS, ACTIONS } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/ui/page-wrapper';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    dept: string;
    status: string;
    permissions?: string[];
}

const ROLE_COLORS: Record<string, string> = {
    'super-admin': 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    manager: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    staff: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    user: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export default function StaffAccessViewerPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<Set<string>>(new Set());
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Core Modules']));
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await getModuleAccessData();
        setUsers(data.users);
        setLoading(false);
    };

    const selectUser = (user: User) => {
        setSelectedUser(user);
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
        <PageWrapper className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" />
                    Staff Access Viewer
                </h1>
                <p className="text-muted-foreground text-sm mt-1">View the module access and permissions of all staff members (Read Only).</p>
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
                {/* User List Panel */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="glass-card rounded-2xl border border-border overflow-hidden bg-card shadow-sm">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="w-4 h-4 text-primary" />
                                <h2 className="font-semibold text-foreground">Employees ({filteredUsers.length})</h2>
                            </div>
                            <div className="relative mb-2">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search employees..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <select
                                value={roleFilter}
                                onChange={e => setRoleFilter(e.target.value)}
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none"
                            >
                                <option value="All">All Roles</option>
                                <option value="super-admin">super-admin</option>
                                <option value="admin">admin</option>
                                <option value="manager">manager</option>
                                <option value="staff">staff</option>
                            </select>
                        </div>

                        <div className="divide-y divide-border max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
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
                        </div>
                    </div>
                </div>

                {/* Permissions Viewer Panel (Read Only) */}
                <div className="lg:col-span-3">
                    {selectedUser ? (
                        <div className="space-y-4">
                            {/* User Header */}
                            <div className="glass-card rounded-2xl border border-border p-5 bg-card shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                        {selectedUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground">{selectedUser.name}</h3>
                                        <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Active Role</p>
                                    <span className={cn('px-2.5 py-1 rounded text-xs font-bold mt-1 inline-block border', ROLE_COLORS[selectedUser.role] || ROLE_COLORS.user)}>
                                        {selectedUser.role}
                                    </span>
                                </div>
                            </div>

                            {/* Matrix */}
                            <div className="glass-card rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-border bg-muted/30 flex justify-between items-center">
                                    <h3 className="font-semibold text-foreground">Current Permissions</h3>
                                    <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                                        {ACTIONS.map(a => (
                                            <span key={a.code} className="font-medium">{a.label.split(' ')[0]}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="divide-y divide-border max-h-[calc(100vh-360px)] overflow-y-auto custom-scrollbar">
                                    {MODULE_GROUPS.map(group => (
                                        <div key={group.category}>
                                            <button
                                                onClick={() => toggleGroup(group.category)}
                                                className="w-full px-5 py-3 flex items-center justify-between bg-muted/20 hover:bg-muted/40 transition-colors"
                                            >
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{group.category}</span>
                                                {expandedGroups.has(group.category) ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                            </button>

                                            {expandedGroups.has(group.category) && group.modules.map(module => {
                                                return (
                                                    <div key={module.code} className="px-5 py-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-medium text-foreground">{module.label}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {ACTIONS.map(action => {
                                                                const permKey = getPermKey(module.code, action.code);
                                                                const hasIt = selectedUser.role === 'super-admin' || permissions.has(permKey);
                                                                return (
                                                                    <div
                                                                        key={action.code}
                                                                        title={`${action.label} – ${module.label}`}
                                                                        className={cn(
                                                                            'w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-bold transition-all',
                                                                            hasIt ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-background border-border text-muted-foreground/30'
                                                                        )}
                                                                    >
                                                                        {hasIt ? action.code[0].toUpperCase() : <X className="w-3 h-3 opacity-30" />}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 border-t border-border bg-muted/20 text-xs text-muted-foreground text-center">
                                    <Shield className="w-4 h-4 inline-block -mt-1 mr-1" /> View Only mode. Permissions are managed by Super Admins.
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card rounded-2xl border border-dashed border-border bg-card/50 flex flex-col items-center justify-center py-24 text-center px-8 relative top-4">
                            <Shield className="w-16 h-16 text-muted-foreground/20 mb-4" />
                            <h3 className="font-semibold text-foreground">Select an Employee</h3>
                            <p className="text-sm text-muted-foreground mt-2 max-w-xs">Choose an employee from the panel to view their assigned module access.</p>
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
}
