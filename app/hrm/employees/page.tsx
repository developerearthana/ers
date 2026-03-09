"use client";

import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Mail, Phone, Edit, Trash2, User as UserIcon, Loader2, MoreVertical, UserCheck, UserX } from 'lucide-react';
import { PageWrapper, CardWrapper } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getAllUsers, createUser, updateUser, deleteUser, toggleUserStatus } from '@/app/actions/user';
import { toast } from 'sonner';
import Link from 'next/link';

interface Employee {
    _id: string;
    id?: string;
    name: string;
    role: string;
    dept: string;
    email: string;
    phone?: string;
    jobTitle?: string;
    status: 'Active' | 'Inactive' | 'On Leave';
    gradient?: string;
}

const gradients = [
    "from-blue-400 to-indigo-500",
    "from-emerald-400 to-teal-500",
    "from-orange-400 to-red-500",
    "from-purple-400 to-fuchsia-500",
    "from-cyan-400 to-sky-500",
];

const ROLES = ['user', 'staff', 'manager', 'admin', 'super-admin', 'vendor', 'customer'];
const DEPARTMENTS = ['General', 'Sales', 'IT', 'Operations', 'HR', 'Finance', 'Marketing', 'Legal'];

type FormData = { name: string; role: string; dept: string; jobTitle: string; email: string; phone: string; password: string; status: 'Active' | 'Inactive' | 'On Leave'; };
const defaultForm: FormData = { name: '', role: 'staff', dept: 'General', jobTitle: '', email: '', phone: '', password: 'password123', status: 'Active' };

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState<FormData>(defaultForm);
    const [searchQuery, setSearchQuery] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [saving, setSaving] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    useEffect(() => { loadEmployees(); }, []);

    const loadEmployees = async () => {
        setLoading(true);
        try {
            const data = await getAllUsers();
            if (data) {
                setEmployees(data.map((emp: any, idx: number) => ({
                    ...emp,
                    gradient: gradients[idx % gradients.length]
                })));
            }
        } catch {
            toast.error("Failed to load employees");
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingEmployee(null);
        setFormData(defaultForm);
        setShowModal(true);
    };

    const openEditModal = (emp: Employee) => {
        setEditingEmployee(emp);
        setFormData({
            name: emp.name,
            role: emp.role,
            dept: emp.dept,
            jobTitle: emp.jobTitle || '',
            email: emp.email,
            phone: emp.phone || '',
            password: '',
            status: emp.status as 'Active' | 'Inactive' | 'On Leave',
        });
        setShowModal(true);
        setOpenMenuId(null);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.email) {
            toast.error("Name and email are required");
            return;
        }
        setSaving(true);
        try {
            let res;
            if (editingEmployee) {
                res = await updateUser({ ...formData, id: editingEmployee._id || editingEmployee.id });
            } else {
                res = await createUser(formData);
            }
            if (res.success) {
                toast.success(editingEmployee ? "Employee updated" : "Employee added");
                setShowModal(false);
                loadEmployees();
            } else {
                toast.error(res.error || "Operation failed");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (emp: Employee) => {
        if (!confirm(`Delete ${emp.name}? This cannot be undone.`)) return;
        setOpenMenuId(null);
        const res = await deleteUser({ id: emp._id || emp.id! });
        if (res.success) {
            toast.success("Employee deleted");
            loadEmployees();
        } else {
            toast.error(res.error || "Failed to delete");
        }
    };

    const handleToggleStatus = async (emp: Employee) => {
        setOpenMenuId(null);
        await toggleUserStatus(emp._id || emp.id!, emp.status);
        toast.success(`Employee ${emp.status === 'Active' ? 'deactivated' : 'activated'}`);
        loadEmployees();
    };

    const filtered = employees.filter(emp => {
        const matchSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchDept = deptFilter === 'All' || emp.dept === deptFilter;
        const matchStatus = statusFilter === 'All' || emp.status === statusFilter;
        return matchSearch && matchDept && matchStatus;
    });

    if (loading) return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    return (
        <PageWrapper className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Employees</h1>
                    <p className="text-muted-foreground mt-1">{employees.length} team members • {employees.filter(e => e.status === 'Active').length} active</p>
                </div>
                <Button onClick={openAddModal} className="shadow-lg shadow-primary/20 hover:scale-105 transition-all w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />Add Employee
                </Button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center border border-border shadow-sm bg-card">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        aria-label="Search employees"
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-sm text-foreground transition-all"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <select
                        aria-label="Department filter"
                        value={deptFilter}
                        onChange={e => setDeptFilter(e.target.value)}
                        className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    >
                        <option value="All">All Depts</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select
                        aria-label="Status filter"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                    </select>
                </div>
            </div>

            {/* Empty State */}
            {filtered.length === 0 && (
                <div className="text-center py-16 text-muted-foreground glass-card rounded-2xl border border-dashed border-border">
                    <UserIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
                    <p className="font-medium">No employees found</p>
                    <p className="text-sm mt-1">Try adjusting filters or add a new employee.</p>
                </div>
            )}

            {/* Employee Grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((emp, idx) => (
                    <CardWrapper key={emp._id} delay={idx * 0.04} className="glass-card p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-xl transition-all group relative bg-card">
                        {/* Actions Menu */}
                        <div className="absolute top-3 right-3">
                            <button
                                aria-label="Employee actions"
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                onClick={() => setOpenMenuId(openMenuId === emp._id ? null : emp._id)}
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>
                            {openMenuId === emp._id && (
                                <div className="absolute right-0 top-full mt-1 w-44 bg-popover border border-border rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    <button
                                        onClick={() => openEditModal(emp)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                                    >
                                        <Edit className="w-3.5 h-3.5" /> Edit Employee
                                    </button>
                                    <Link
                                        href={`/hrm/employees/${emp._id}/salary`}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                        onClick={() => setOpenMenuId(null)}
                                    >
                                        <Filter className="w-3.5 h-3.5" /> Configure Salary
                                    </Link>
                                    <button
                                        onClick={() => handleToggleStatus(emp)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-left"
                                    >
                                        {emp.status === 'Active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                        {emp.status === 'Active' ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <div className="h-px bg-border mx-2" />
                                    <button
                                        onClick={() => handleDelete(emp)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-center text-center mb-5">
                            <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white mb-3 shadow-lg bg-gradient-to-br", emp.gradient)}>
                                {emp.name.charAt(0).toUpperCase()}
                            </div>
                            <h3 className="font-bold text-foreground">{emp.name}</h3>
                            <p className="text-xs font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-md mt-1">{emp.jobTitle || emp.role}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{emp.dept}</p>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-border">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Mail className="w-3 h-3 shrink-0" />
                                <span className="truncate">{emp.email}</span>
                            </div>
                            {emp.phone && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Phone className="w-3 h-3 shrink-0" />
                                    <span>{emp.phone}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' :
                                    emp.status === 'On Leave' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' :
                                        'bg-muted text-muted-foreground border-border'
                            )}>
                                {emp.status}
                            </span>
                            <Link
                                href={`/hrm/employees/${emp._id}/salary`}
                                className="text-xs text-primary hover:underline font-medium"
                            >
                                Salary →
                            </Link>
                        </div>
                    </CardWrapper>
                ))}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            <div className="glass-card bg-card rounded-2xl p-6 shadow-2xl border border-border">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-foreground">
                                        {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                                    </h3>
                                    <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>✕</Button>
                                </div>

                                <div className="space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Full Name *</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Arjun Sharma"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Email *</label>
                                        <input
                                            type="email"
                                            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="arjun@company.com"
                                            disabled={!!editingEmployee}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Role */}
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">System Role</label>
                                            <select
                                                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                                                value={formData.role}
                                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            >
                                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>
                                        {/* Dept */}
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Department</label>
                                            <select
                                                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                                                value={formData.dept}
                                                onChange={e => setFormData({ ...formData, dept: e.target.value })}
                                            >
                                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Job Title */}
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Job Title</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={formData.jobTitle}
                                            onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                                            placeholder="e.g. Senior Developer"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Phone */}
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Phone</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                        {/* Status */}
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Status</label>
                                            <select
                                                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                                                value={formData.status}
                                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                                <option value="On Leave">On Leave</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Password (only for new employees) */}
                                    {!editingEmployee && (
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Initial Password</label>
                                            <input
                                                type="password"
                                                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                placeholder="Minimum 8 characters"
                                            />
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                        <Button variant="ghost" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
                                        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                            {editingEmployee ? 'Save Changes' : 'Add Employee'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Click-outside handler for dropdown */}
            {openMenuId && (
                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
            )}
        </PageWrapper>
    );
}
