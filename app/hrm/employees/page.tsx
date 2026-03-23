"use client";

import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Mail, Phone, Trash2, User as UserIcon, Loader2, MoreVertical, UserCheck, UserX, ArrowLeft, ArrowRight, Check, Edit } from 'lucide-react';
import { PageWrapper, CardWrapper } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getAllUsers } from '@/app/actions/user';
import { getDepartments } from '@/app/actions/organization';
import { createEmployee, updateEmployee, getEmployees, deleteEmployee, toggleEmployeeStatus } from '@/app/actions/employee';
import { getMasters } from '@/app/actions/masters';
import { toast } from 'sonner';
import Link from 'next/link';
import { ImageUpload } from '@/components/ui/image-upload';

interface Employee {
    _id: string;
    name: string;
    dept?: string;
    email?: string;
    phone?: string;
    jobTitle?: string;
    employeeCategory?: string;
    employeeId?: string;
    status: 'Active' | 'Inactive' | 'On Leave';
    gradient?: string;
}

interface Department { _id: string; name: string; }

const gradients = [
    "from-blue-400 to-indigo-500",
    "from-emerald-400 to-teal-500",
    "from-orange-400 to-red-500",
    "from-purple-400 to-fuchsia-500",
    "from-cyan-400 to-sky-500",
];

const STEPS = ['Personal Info', 'Other Details'];
const DRAFT_KEY = 'hrm_employee_draft';

const emptyForm = {
    image: '', employeeCategory: '', jobTitle: '', dept: '', employeeId: '',
    name: '', email: '', phone: '', alternatePhone: '', address: '', dateOfBirth: '', gender: '', maritalStatus: '',
    reportingTo: '', probationEndDate: '', noticePeriod: '',
    accountType: '', accountHolderName: '', bankName: '', accountNumber: '', upiId: '', ifscCode: '', bankBranch: '',
};

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [empCategories, setEmpCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [hasDraft, setHasDraft] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
        // Check for existing draft on mount
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) setHasDraft(true);
    }, []);

    // Auto-save draft whenever formData changes (only for new employee, not edit)
    useEffect(() => {
        if (showAddForm && !editingEmployee) {
            const isEmpty = Object.values(formData).every(v => v === '');
            if (!isEmpty) {
                localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData, currentStep }));
            }
        }
    }, [formData, currentStep, showAddForm, editingEmployee]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [empData, usersData, deptData, catRes] = await Promise.all([
                getEmployees(),
                getAllUsers(),
                getDepartments(),
                getMasters('EmployeeCategory'),
            ]);
            setEmployees((empData || []).map((e: any, i: number) => ({ ...e, gradient: gradients[i % gradients.length] })));
            setAllUsers(usersData || []);
            setDepartments(deptData || []);
            if (catRes.success && catRes.data) setEmpCategories(catRes.data.map((c: any) => c.label));
        } catch { toast.error("Failed to load data"); }
        finally { setLoading(false); }
    };

    const clearDraft = () => { localStorage.removeItem(DRAFT_KEY); setHasDraft(false); };

    const openAdd = () => {
        setEditingEmployee(null);
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) {
            try {
                const { formData: savedForm, currentStep: savedStep } = JSON.parse(draft);
                setFormData(savedForm);
                setCurrentStep(savedStep || 0);
            } catch {
                setFormData(emptyForm);
                setCurrentStep(0);
            }
        } else {
            setFormData(emptyForm);
            setCurrentStep(0);
        }
        setShowAddForm(true);
    };

    const openEdit = (emp: any) => {
        setEditingEmployee(emp);
        setFormData({
            image: emp.image || '',
            employeeCategory: emp.employeeCategory || '',
            jobTitle: emp.jobTitle || '',
            dept: emp.dept || '',
            employeeId: emp.employeeId || '',
            name: emp.name || '',
            email: emp.email || '',
            phone: emp.phone || '',
            alternatePhone: emp.alternatePhone || '',
            address: emp.address || '',
            dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.substring(0, 10) : '',
            gender: emp.gender || '',
            maritalStatus: emp.maritalStatus || '',
            reportingTo: emp.reportingManager || '',
            probationEndDate: emp.probationEndDate ? emp.probationEndDate.substring(0, 10) : '',
            noticePeriod: emp.noticePeriod ? String(emp.noticePeriod) : '',
            accountType: emp.bankDetails?.accountType || '',
            accountHolderName: emp.bankDetails?.accountHolderName || '',
            bankName: emp.bankDetails?.bankName || '',
            accountNumber: emp.bankDetails?.accountNumber || '',
            upiId: emp.bankDetails?.upiId || '',
            ifscCode: emp.bankDetails?.ifscCode || '',
            bankBranch: emp.bankDetails?.bankBranch || '',
        });
        setCurrentStep(0);
        setOpenMenuId(null);
        setShowAddForm(true);
    };

    const closeAdd = (discardDraft = false) => {
        if (discardDraft) clearDraft();
        setShowAddForm(false);
        setCurrentStep(0);
        setEditingEmployee(null);
    };
    const set = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

    const validateStep = () => {
        if (currentStep === 0 && !formData.name.trim()) {
            toast.error("Full name is required"); return false;
        }
        return true;
    };

    const handleNext = () => { if (validateStep()) setCurrentStep(s => s + 1); };
    const handleBack = () => setCurrentStep(s => s - 1);

    const handleSubmit = async () => {
        if (!validateStep()) return;
        setSaving(true);
        try {
            const payload = {
                ...formData,
                reportingManager: formData.reportingTo,
                noticePeriod: formData.noticePeriod ? Number(formData.noticePeriod) : undefined,
            };
            const res = editingEmployee
                ? await updateEmployee(editingEmployee._id, payload)
                : await createEmployee(payload);
            if (res.success) {
                toast.success(editingEmployee ? "Employee updated" : "Employee added successfully");
                if (!editingEmployee) clearDraft();
                closeAdd();
                loadData();
            } else {
                toast.error(res.error || "Operation failed");
            }
        } catch { toast.error("An error occurred"); }
        finally { setSaving(false); }
    };

    const handleDelete = async (emp: Employee) => {
        if (!confirm(`Delete ${emp.name}? This cannot be undone.`)) return;
        setOpenMenuId(null);
        const res = await deleteEmployee(emp._id);
        if (res.success) { toast.success("Employee deleted"); loadData(); }
        else toast.error(res.error || "Failed to delete");
    };

    const handleToggleStatus = async (emp: Employee) => {
        setOpenMenuId(null);
        const res = await toggleEmployeeStatus(emp._id, emp.status);
        if (res.success) { toast.success(`Employee ${res.status === 'Active' ? 'activated' : 'deactivated'}`); loadData(); }
        else toast.error("Failed to update status");
    };

    const filtered = employees.filter(emp => {
        const matchSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (emp.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchDept = deptFilter === 'All' || emp.dept === deptFilter;
        const matchStatus = statusFilter === 'All' || emp.status === statusFilter;
        return matchSearch && matchDept && matchStatus;
    });

    const inputCls = "w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all";
    const selectCls = inputCls + " cursor-pointer";
    const field = (label: string, required: boolean, children: React.ReactNode) => (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {label}{required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {children}
        </div>
    );

    // ── Multi-step Add Form Screen ──────────────────────────────────────────
    if (showAddForm) {
        return (
            <div className="min-h-screen bg-background">
                {/* Top bar */}
                <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between shadow-sm">
                    <button onClick={() => closeAdd(false)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Employees
                    </button>
                    <div className="flex flex-col items-center">
                        <h1 className="font-bold text-foreground text-lg">{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h1>
                        {!editingEmployee && (
                            <span className="text-xs text-emerald-600 font-medium">● Draft auto-saved</span>
                        )}
                    </div>
                    {!editingEmployee ? (
                        <button
                            onClick={() => closeAdd(true)}
                            className="text-xs text-red-500 hover:text-red-600 font-medium border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Discard Draft
                        </button>
                    ) : (
                        <div className="w-28" />
                    )}
                </div>

                {/* Step Indicator */}
                <div className="max-w-5xl mx-auto px-6 pt-8 pb-2">
                    <div className="flex items-center">
                        {STEPS.map((step, idx) => (
                            <div key={step} className="flex items-center flex-1">
                                <div className="flex flex-col items-center">
                                    <div className={cn(
                                        "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                                        idx < currentStep ? "bg-primary border-primary text-white" :
                                            idx === currentStep ? "border-primary text-primary bg-primary/10" :
                                                "border-border text-muted-foreground bg-card"
                                    )}>
                                        {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
                                    </div>
                                    <span className={cn("text-xs mt-1.5 font-medium whitespace-nowrap", idx === currentStep ? "text-primary" : "text-muted-foreground")}>
                                        {step}
                                    </span>
                                </div>
                                {idx < STEPS.length - 1 && (
                                    <div className={cn("flex-1 h-0.5 mx-2 mt-[-12px]", idx < currentStep ? "bg-primary" : "bg-border")} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Body — wider card */}
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6">

                        {/* ── Step 1: Personal Info ── */}
                        {currentStep === 0 && (
                            <>
                                <div>
                                    <h2 className="text-base font-bold text-foreground mb-1">Personal Information</h2>
                                    <p className="text-sm text-muted-foreground">Basic details and personal information of the employee.</p>
                                </div>
                                {/* Two-column layout: fields left, photo right */}
                                <div className="flex flex-col lg:flex-row gap-6">
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {field("Full Name", true,
                                            <input className={inputCls} value={formData.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Arjun Sharma" />
                                        )}
                                        {field("Employee ID", false,
                                            <input className={inputCls} value={formData.employeeId} onChange={e => set('employeeId', e.target.value)} placeholder="e.g. EMP-001" />
                                        )}
                                        {field("Email Address", false,
                                            <input type="email" className={inputCls} value={formData.email} onChange={e => set('email', e.target.value)} placeholder="arjun@example.com" />
                                        )}
                                        {field("Employee Category", false,
                                            <select className={selectCls} value={formData.employeeCategory} onChange={e => set('employeeCategory', e.target.value)}>
                                                <option value="">Select Category</option>
                                                {empCategories.length > 0
                                                    ? empCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)
                                                    : <option disabled>No categories — add in Masters</option>
                                                }
                                            </select>
                                        )}
                                        {field("Job Title", false,
                                            <input className={inputCls} value={formData.jobTitle} onChange={e => set('jobTitle', e.target.value)} placeholder="e.g. Senior Developer" />
                                        )}
                                        {field("Department", false,
                                            <select className={selectCls} value={formData.dept} onChange={e => set('dept', e.target.value)}>
                                                <option value="">Select Department</option>
                                                {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                                            </select>
                                        )}
                                        {field("Contact Number", false,
                                            <input className={inputCls} value={formData.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
                                        )}
                                        {field("Alternate Contact Number", false,
                                            <input className={inputCls} value={formData.alternatePhone} onChange={e => set('alternatePhone', e.target.value)} placeholder="+91 98765 43210" />
                                        )}
                                        {field("Date of Birth", false,
                                            <input
                                                type="text"
                                                className={inputCls}
                                                value={formData.dateOfBirth}
                                                onChange={e => set('dateOfBirth', e.target.value)}
                                                placeholder="DD-MM-YYYY"
                                                onFocus={e => { if (!formData.dateOfBirth) e.target.type = 'date'; }}
                                                onBlur={e => { if (!formData.dateOfBirth) e.target.type = 'text'; }}
                                            />
                                        )}
                                        {field("Gender", false,
                                            <select className={selectCls} value={formData.gender} onChange={e => set('gender', e.target.value)}>
                                                <option value="">Select Gender</option>
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                                <option>Prefer not to say</option>
                                            </select>
                                        )}
                                        {field("Marital Status", false,
                                            <select className={selectCls} value={formData.maritalStatus} onChange={e => set('maritalStatus', e.target.value)}>
                                                <option value="">Select Status</option>
                                                <option>Single</option>
                                                <option>Married</option>
                                                <option>Divorced</option>
                                                <option>Widowed</option>
                                            </select>
                                        )}
                                        <div className="sm:col-span-2">
                                            {field("Address", false,
                                                <textarea
                                                    className={inputCls + " resize-none"}
                                                    rows={2}
                                                    value={formData.address}
                                                    onChange={e => set('address', e.target.value)}
                                                    placeholder="Street, City, State, PIN"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    {/* Photo — top right */}
                                    <div className="flex flex-col items-center gap-2 lg:w-44 shrink-0 self-start">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide self-start lg:self-center">Photo</p>
                                        <ImageUpload
                                            value={formData.image}
                                            onChange={url => set('image', url)}
                                            variant="circle"
                                            label="Upload Photo"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── Step 2: Other Details (Employment + Banking) ── */}
                        {currentStep === 1 && (
                            <>
                                {/* Employment Details */}
                                <div>
                                    <h2 className="text-base font-bold text-foreground mb-1">Employment Details</h2>
                                    <p className="text-sm text-muted-foreground">Reporting structure, probation and notice period.</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {field("Reporting To", false,
                                        <select className={selectCls} value={formData.reportingTo} onChange={e => set('reportingTo', e.target.value)}>
                                            <option value="">Select</option>
                                            {allUsers.map((u: any) => (
                                                <option key={u._id} value={u.name}>{u.name}{u.jobTitle ? ` — ${u.jobTitle}` : ''}</option>
                                            ))}
                                        </select>
                                    )}
                                    {field("Probation Period End Date", false,
                                        <input type="date" className={inputCls} value={formData.probationEndDate} onChange={e => set('probationEndDate', e.target.value)} />
                                    )}
                                    {field("Notice Period (months)", false,
                                        <input type="number" min="0" max="24" className={inputCls} value={formData.noticePeriod} onChange={e => set('noticePeriod', e.target.value)} placeholder="e.g. 2" />
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-border pt-6">
                                    <h2 className="text-base font-bold text-foreground mb-1">Banking Details</h2>
                                    <p className="text-sm text-muted-foreground">Bank account information for payroll processing.</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {field("Account Type", false,
                                        <select className={selectCls} value={formData.accountType} onChange={e => set('accountType', e.target.value)}>
                                            <option value="">Select Type</option>
                                            <option>Savings</option>
                                            <option>Checking</option>
                                        </select>
                                    )}
                                    {field("Account Holder Name", false,
                                        <input className={inputCls} value={formData.accountHolderName} onChange={e => set('accountHolderName', e.target.value)} placeholder="As per bank records" />
                                    )}
                                    {field("Bank Name", false,
                                        <input className={inputCls} value={formData.bankName} onChange={e => set('bankName', e.target.value)} placeholder="e.g. HDFC Bank" />
                                    )}
                                    {field("Account Number", false,
                                        <input className={inputCls} value={formData.accountNumber} onChange={e => set('accountNumber', e.target.value)} placeholder="Enter account number" />
                                    )}
                                    {field("UPI ID", false,
                                        <input className={inputCls} value={formData.upiId} onChange={e => set('upiId', e.target.value)} placeholder="e.g. arjun@upi" />
                                    )}
                                    {field("IFSC Code", false,
                                        <input className={inputCls} value={formData.ifscCode} onChange={e => set('ifscCode', e.target.value.toUpperCase())} placeholder="e.g. HDFC0001234" />
                                    )}
                                    {field("Bank Branch Details", false,
                                        <input className={inputCls} value={formData.bankBranch} onChange={e => set('bankBranch', e.target.value)} placeholder="Branch name & address" />
                                    )}
                                </div>
                            </>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between items-center pt-6 border-t border-border">
                            <Button variant="outline" onClick={currentStep === 0 ? closeAdd : handleBack} disabled={saving}>
                                {currentStep === 0 ? 'Cancel' : <><ArrowLeft className="w-4 h-4 mr-1.5" />Back</>}
                            </Button>
                            {currentStep < STEPS.length - 1 ? (
                                <Button onClick={handleNext}>
                                    Next <ArrowRight className="w-4 h-4 ml-1.5" />
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={saving} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-1.5" />}
                                    {editingEmployee ? 'Update Employee' : 'Save Employee'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Employees List ──────────────────────────────────────────────────────
    if (loading) return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    return (
        <PageWrapper className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Employees</h1>
                    <p className="text-muted-foreground mt-1">{employees.length} employees • {employees.filter(e => e.status === 'Active').length} active</p>
                </div>
                <Button onClick={openAdd} className="shadow-lg shadow-primary/20 hover:scale-105 transition-all w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />Add Employee
                </Button>
            </div>

            {/* Draft resume banner */}
            {hasDraft && (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                        <span className="text-amber-600 text-lg">📝</span>
                        <div>
                            <p className="text-sm font-semibold text-amber-800">You have an unsaved employee draft</p>
                            <p className="text-xs text-amber-600">Your previous form progress was saved. Continue where you left off.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                        <button onClick={openAdd} className="text-sm font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors">
                            Continue Draft
                        </button>
                        <button onClick={clearDraft} className="text-xs text-amber-500 hover:text-amber-700 px-2 py-1.5 transition-colors">
                            Discard
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center border border-border shadow-sm bg-card">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input type="text" placeholder="Search by name or email..." value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-sm text-foreground"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                        <option value="All">All Depts</option>
                        {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                    </select>
                </div>
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16 text-muted-foreground glass-card rounded-2xl border border-dashed border-border">
                    <UserIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
                    <p className="font-medium">No employees found</p>
                    <p className="text-sm mt-1">Try adjusting filters or add a new employee.</p>
                </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((emp, idx) => (
                    <CardWrapper key={emp._id} delay={idx * 0.04} className="glass-card p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-xl transition-all group relative bg-card">
                        <div className="absolute top-3 right-3">
                            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                onClick={() => setOpenMenuId(openMenuId === emp._id ? null : emp._id)}>
                                <MoreVertical className="w-4 h-4" />
                            </button>
                            {openMenuId === emp._id && (
                                <div className="absolute right-0 top-full mt-1 w-44 bg-popover border border-border rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    <button onClick={() => openEdit(emp)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left">
                                        <Edit className="w-3.5 h-3.5" /> Edit Employee
                                    </button>
                                    <button onClick={() => handleToggleStatus(emp)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-left">
                                        {emp.status === 'Active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                        {emp.status === 'Active' ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <div className="h-px bg-border mx-2" />
                                    <button onClick={() => handleDelete(emp)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
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
                            <p className="text-xs font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-md mt-1">{emp.jobTitle || emp.employeeCategory || '—'}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{emp.dept || '—'}</p>
                            {emp.employeeId && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{emp.employeeId}</p>}
                        </div>

                        <div className="space-y-2 pt-4 border-t border-border">
                            {emp.email && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Mail className="w-3 h-3 shrink-0" /><span className="truncate">{emp.email}</span>
                                </div>
                            )}
                            {emp.phone && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Phone className="w-3 h-3 shrink-0" /><span>{emp.phone}</span>
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
                        </div>
                    </CardWrapper>
                ))}
            </div>

            {openMenuId && <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />}
        </PageWrapper>
    );
}
