"use client";

import { useState, useEffect, useCallback } from 'react';
import {
    Target, Plus, Loader2, CheckCircle2, Clock, AlertCircle,
    TrendingUp, Users, User, Trash2, Edit3, ChevronDown, X, Check, ChevronsUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { format, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import {
    createKPIAssignment, getAllKPIAssignments, getMyKPIAssignments,
    updateKPIAssignment, deleteKPIAssignment
} from '@/app/actions/kpi-assignments';
import { getKPITemplates } from '@/app/actions/kpi';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { getTeams } from '@/app/actions/organization';
import { getAllUsers } from '@/app/actions/user';

const STATUS_COLORS: Record<string, string> = {
    'Not Started': 'bg-gray-100 text-gray-700 border-gray-200',
    'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
    'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Missed': 'bg-red-50 text-red-700 border-red-200',
};

const PRIORITY_COLORS: Record<string, string> = {
    Low: 'bg-gray-50 text-gray-600',
    Medium: 'bg-amber-50 text-amber-700',
    High: 'bg-red-50 text-red-700',
};

const METRICS = [
    'Revenue', 'Leads Generated', 'Deals Closed', 'Customer Satisfaction',
    'Employee Retention', 'Tasks Completed', 'Projects Delivered', 'Response Time',
    'Sales Growth', 'Cost Reduction', 'Attendance Rate', 'Custom Metric',
];

interface KPIAssignment {
    _id: string;
    title: string;
    description?: string;
    metric: string;
    unit: string;
    target: number;
    actual: number;
    progress: number;
    status: string;
    priority: string;
    frequency: string;
    dueDate: string;
    notes?: string;
    assignedToUser?: { _id: string; name: string; email: string; role: string; dept: string; image?: string };
    assignedToTeam?: { _id: string; name: string };
    assignedBy?: { _id: string; name: string };
    completedAt?: string;
    createdAt: string;
}

const defaultForm = {
    title: '',
    description: '',
    metric: '',
    unit: 'Count',
    target: 100,
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    frequency: 'Monthly',
    dueDate: '',
    assignType: 'user' as 'user' | 'team',
    assignedToUser: '',
    assignedToTeam: '',
};

export default function KPIAssignmentManager() {
    const [kpis, setKpis] = useState<KPIAssignment[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [form, setForm] = useState(defaultForm);
    const [metricOpen, setMetricOpen] = useState(false);
    const [kpiTemplates, setKpiTemplates] = useState<string[]>(METRICS);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [kpisRes, teamsData, usersData, templatesRes] = await Promise.all([
                getMyKPIAssignments(),
                getTeams(),
                getAllUsers(),
                getKPITemplates(),
            ]);
            if (kpisRes.success) setKpis(kpisRes.data || []);
            setTeams(teamsData || []);
            setUsers(usersData || []);

            // Generate combined metrics list from templates + defaults
            if (templatesRes.success && templatesRes.data) {
                const templateNames = templatesRes.data.map((t: any) => t.name);
                const combined = Array.from(new Set([...templateNames, ...METRICS]));
                setKpiTemplates(combined as string[]);
            } else {
                setKpiTemplates(METRICS);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => {
        setEditingId(null);
        setForm(defaultForm);
        setSheetOpen(true);
    };

    const openEdit = (kpi: KPIAssignment) => {
        setEditingId(kpi._id);
        setForm({
            title: kpi.title,
            description: kpi.description || '',
            metric: kpi.metric,
            unit: kpi.unit,
            target: kpi.target,
            priority: kpi.priority as any,
            frequency: kpi.frequency,
            dueDate: format(new Date(kpi.dueDate), 'yyyy-MM-dd'),
            assignType: kpi.assignedToTeam ? 'team' : 'user',
            assignedToUser: kpi.assignedToUser?._id || '',
            assignedToTeam: kpi.assignedToTeam?._id || '',
        });
        setSheetOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.metric || !form.dueDate) {
            toast.error('Please fill in required fields');
            return;
        }
        if (form.assignType === 'user' && !form.assignedToUser) {
            toast.error('Please select a user');
            return;
        }
        if (form.assignType === 'team' && !form.assignedToTeam) {
            toast.error('Please select a team');
            return;
        }

        setSaving(true);
        try {
            let res;
            if (editingId) {
                res = await updateKPIAssignment({
                    id: editingId,
                    title: form.title,
                    description: form.description,
                    target: form.target,
                    dueDate: form.dueDate,
                    priority: form.priority,
                });
            } else {
                res = await createKPIAssignment({
                    title: form.title,
                    description: form.description,
                    metric: form.metric,
                    unit: form.unit,
                    target: form.target,
                    priority: form.priority,
                    frequency: form.frequency,
                    dueDate: form.dueDate,
                    assignedToUser: form.assignType === 'user' ? form.assignedToUser : undefined,
                    assignedToTeam: form.assignType === 'team' ? form.assignedToTeam : undefined,
                });
            }

            if (res.success) {
                toast.success(editingId ? 'KPI updated' : 'KPI assigned successfully ✅');
                setSheetOpen(false);
                load();
            } else {
                toast.error(res.error || 'Failed');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this KPI assignment?')) return;
        const res = await deleteKPIAssignment(id);
        if (res.success) { toast.success('Deleted'); load(); }
        else toast.error(res.error || 'Delete failed');
    };

    const filtered = kpis.filter(k => {
        const statusOk = filterStatus === 'All' || k.status === filterStatus;
        const typeOk = filterType === 'All' ||
            (filterType === 'User' && k.assignedToUser) ||
            (filterType === 'Team' && k.assignedToTeam);
        return statusOk && typeOk;
    });

    const stats = {
        total: kpis.length,
        completed: kpis.filter(k => k.status === 'Completed').length,
        inProgress: kpis.filter(k => k.status === 'In Progress').length,
        notStarted: kpis.filter(k => k.status === 'Not Started').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                        <Target className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">KPI Assignments</h2>
                        <p className="text-sm text-gray-500">Assign KPIs to users or teams</p>
                    </div>
                </div>
                <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" /> Assign KPI
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: stats.total, icon: Target, color: 'text-gray-700 bg-gray-50 border-gray-200' },
                    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                    { label: 'In Progress', value: stats.inProgress, icon: TrendingUp, color: 'text-blue-700 bg-blue-50 border-blue-200' },
                    { label: 'Not Started', value: stats.notStarted, icon: Clock, color: 'text-amber-700 bg-amber-50 border-amber-200' },
                ].map(s => (
                    <div key={s.label} className={cn('rounded-xl border p-4 flex items-center gap-3', s.color)}>
                        <s.icon className="w-5 h-5 shrink-0" />
                        <div>
                            <p className="text-2xl font-bold">{s.value}</p>
                            <p className="text-xs font-medium">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 bg-white border rounded-xl p-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Status:</span>
                    {['All', 'Not Started', 'In Progress', 'Completed', 'Missed'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={cn('px-3 py-1 text-xs font-bold rounded-lg transition-all', filterStatus === s ? 'bg-primary text-white' : 'text-gray-600 border border-gray-200 hover:bg-gray-50')}
                        >{s}</button>
                    ))}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs font-bold text-gray-500 uppercase">Type:</span>
                    {['All', 'User', 'Team'].map(t => (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={cn('px-3 py-1 text-xs font-bold rounded-lg transition-all', filterType === t ? 'bg-primary text-white' : 'text-gray-600 border border-gray-200 hover:bg-gray-50')}
                        >{t}</button>
                    ))}
                </div>
            </div>

            {/* KPI List */}
            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-2xl">
                    <Target className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold text-gray-500">No KPI assignments found</p>
                    <p className="text-sm text-gray-400 mt-1">Click &quot;Assign KPI&quot; to get started</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(kpi => {
                        const overdue = kpi.status !== 'Completed' && isPast(new Date(kpi.dueDate));
                        return (
                            <div key={kpi._id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h4 className="font-bold text-gray-900 truncate">{kpi.title}</h4>
                                            <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold border', STATUS_COLORS[kpi.status])}>
                                                {kpi.status}
                                            </span>
                                            <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', PRIORITY_COLORS[kpi.priority])}>
                                                {kpi.priority}
                                            </span>
                                            {overdue && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                                                    Overdue
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                {kpi.assignedToTeam ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                                <strong className="text-gray-700">
                                                    {kpi.assignedToTeam ? kpi.assignedToTeam.name : kpi.assignedToUser?.name || '—'}
                                                </strong>
                                            </span>
                                            <span>{kpi.metric} · {kpi.frequency}</span>
                                            <span className={overdue ? 'text-red-500 font-semibold' : ''}>
                                                Due: {format(new Date(kpi.dueDate), 'dd MMM yyyy')}
                                            </span>
                                            {kpi.assignedBy && <span>by {kpi.assignedBy.name}</span>}
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-2.5 flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={cn('h-full rounded-full transition-all', kpi.status === 'Completed' ? 'bg-emerald-500' : 'bg-primary')}
                                                    style={{ width: `${kpi.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-gray-600 shrink-0">
                                                {kpi.actual} / {kpi.target} {kpi.unit} ({kpi.progress}%)
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => openEdit(kpi)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(kpi._id)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create / Edit Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            {editingId ? 'Edit KPI Assignment' : 'Assign New KPI'}
                        </SheetTitle>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                        {/* Title */}
                        <div className="space-y-1.5">
                            <Label>KPI Title *</Label>
                            <Input
                                required
                                placeholder="e.g. Increase Q2 Sales Revenue"
                                value={form.title}
                                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label>Description</Label>
                            <textarea
                                className="w-full border rounded-lg p-2.5 text-sm resize-none text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                rows={2}
                                placeholder="Optional details about this KPI..."
                                value={form.description}
                                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            />
                        </div>

                        {/* Metric + Unit */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5 relative flex flex-col z-50">
                                <Label className="mb-1">Metric *</Label>
                                <div className="relative">
                                    <Input 
                                        required
                                        placeholder="Search or enter metric..."
                                        value={form.metric}
                                        onChange={e => {
                                            setForm(p => ({ ...p, metric: e.target.value }));
                                            setMetricOpen(true);
                                        }}
                                        onFocus={() => setMetricOpen(true)}
                                        onBlur={() => setTimeout(() => setMetricOpen(false), 200)}
                                        className="w-full pr-8 bg-white"
                                    />
                                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                                {metricOpen && (
                                    <div className="absolute top-[100%] left-0 w-full mt-1 bg-white border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto z-[200]">
                                        {kpiTemplates
                                            .filter(m => m.toLowerCase().includes(form.metric.toLowerCase()))
                                            .map(m => (
                                                <div 
                                                    key={m}
                                                    className="px-3 py-2.5 text-sm cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors border-b border-border/50 last:border-0"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        setForm(p => ({ ...p, metric: m }));
                                                        setMetricOpen(false);
                                                    }}
                                                >
                                                    {m}
                                                </div>
                                            ))}
                                        {form.metric && !kpiTemplates.some(m => m.toLowerCase() === form.metric.toLowerCase()) && (
                                            <div 
                                                className="px-3 py-2.5 text-sm cursor-pointer bg-gray-50 text-primary font-medium hover:bg-gray-100"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    setMetricOpen(false);
                                                }}
                                            >
                                                Use custom metric: "{form.metric}"
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Unit</Label>
                                <Select value={form.unit} onValueChange={v => setForm(p => ({ ...p, unit: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {['Count', '%', 'INR', 'USD', 'Hours', 'Days', 'Rating'].map(u => (
                                            <SelectItem key={u} value={u}>{u}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Target + Priority */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Target Value *</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    required
                                    value={form.target}
                                    onChange={e => setForm(p => ({ ...p, target: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Priority</Label>
                                <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v as any }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {['Low', 'Medium', 'High'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Frequency + Due Date */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Frequency</Label>
                                <Select value={form.frequency} onValueChange={v => setForm(p => ({ ...p, frequency: v }))} disabled={!!editingId}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'].map(f => (
                                            <SelectItem key={f} value={f}>{f}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Due Date *</Label>
                                <Input
                                    type="date"
                                    required
                                    value={form.dueDate}
                                    onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Assign To — only for create */}
                        {!editingId && (
                            <div className="space-y-3 border-t pt-4">
                                <Label className="text-sm font-bold">Assign To *</Label>
                                <div className="flex gap-2">
                                    {(['user', 'team'] as const).map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setForm(p => ({ ...p, assignType: t, assignedToUser: '', assignedToTeam: '' }))}
                                            className={cn(
                                                'flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all flex items-center justify-center gap-2',
                                                form.assignType === t
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                            )}
                                        >
                                            {t === 'user' ? <User className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                                            {t === 'user' ? 'Individual User' : 'Team'}
                                        </button>
                                    ))}
                                </div>

                                {form.assignType === 'user' ? (
                                    <Select value={form.assignedToUser} onValueChange={v => setForm(p => ({ ...p, assignedToUser: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Select a user..." /></SelectTrigger>
                                        <SelectContent className="bg-white max-h-60">
                                            {users.map(u => (
                                                <SelectItem key={u._id} value={u._id}>
                                                    {u.name} <span className="text-gray-400 text-xs">({u.dept} · {u.role})</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Select value={form.assignedToTeam} onValueChange={v => setForm(p => ({ ...p, assignedToTeam: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Select a team..." /></SelectTrigger>
                                        <SelectContent className="bg-white max-h-60">
                                            {teams.map(t => (
                                                <SelectItem key={t._id || t.id} value={t._id || t.id}>
                                                    {t.name} <span className="text-gray-400 text-xs">({t.members?.length || 0} members)</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2 border-t">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setSheetOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 bg-primary" disabled={saving}>
                                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {editingId ? 'Save Changes' : 'Assign KPI'}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
}
