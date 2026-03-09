"use client";

import { useState, useEffect, useCallback } from 'react';
import {
    Target, Plus, Loader2, CheckCircle2, Clock, AlertCircle,
    TrendingUp, Users, User, Trash2, Edit3, ChevronDown, X,
    ArrowUpRight, BarChart, History, PlusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { format, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import {
    createKPIAssignment, getAllKPIAssignments, getMyKPIAssignments,
    updateKPIAssignment, deleteKPIAssignment,
    addKPIContribution
} from '@/app/actions/kpi-assignments';
import { getTeams } from '@/app/actions/organization';
import { getAllUsers } from '@/app/actions/user';
import { KPITrackingGrid } from '@/components/kpi/KPITrackingGrid';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

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

export default function KPIAssignmentsMaster() {
    const [kpis, setKpis] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [contribSheetOpen, setContribSheetOpen] = useState(false);
    const [selectedKpi, setSelectedKpi] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    // Form state for assignment
    const [form, setForm] = useState({
        title: '',
        description: '',
        metric: 'Tasks Completed',
        unit: 'Count',
        target: 100,
        priority: 'Medium' as 'Low' | 'Medium' | 'High',
        frequency: 'Monthly',
        dueDate: '',
        assignType: 'team' as 'user' | 'team',
        assignedToUser: '',
        assignedToTeam: '',
    });

    // Form state for contribution
    const [contribForm, setContribForm] = useState({
        value: 0,
        notes: ''
    });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [kpisRes, teamsData, usersData] = await Promise.all([
                getMyKPIAssignments(),
                getTeams(),
                getAllUsers(),
            ]);
            if (kpisRes.success) {
                setKpis(kpisRes.data || []);
            } else {
                toast.error(kpisRes.error || "Failed to load assignments");
            }
            setTeams(teamsData || []);
            setUsers(usersData || []);
        } catch (error) {
            toast.error("Error connecting to server");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.assignType === 'team' && !form.assignedToTeam) {
            toast.error('Please select a team');
            return;
        }
        if (form.assignType === 'user' && !form.assignedToUser) {
            toast.error('Please select a user');
            return;
        }
        setSaving(true);
        try {
            const res = await createKPIAssignment({
                ...form,
                assignedToUser: form.assignType === 'user' ? form.assignedToUser : undefined,
                assignedToTeam: form.assignType === 'team' ? form.assignedToTeam : undefined,
            });
            if (res.success) {
                toast.success('KPI assigned successfully');
                setSheetOpen(false);
                load();
            } else {
                toast.error(res.error || 'Failed to assign KPI');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleContribution = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedKpi) return;
        setSaving(true);
        try {
            const res = await addKPIContribution({
                kpiId: selectedKpi._id,
                value: contribForm.value,
                notes: contribForm.notes
            });
            if (res.success) {
                toast.success('Contribution recorded');
                setContribSheetOpen(false);
                load();
            } else {
                toast.error(res.error || 'Failed to record contribution');
            }
        } finally {
            setSaving(false);
        }
    };

    const getMemberContributions = (kpi: any, memberId: string) => {
        return kpi.contributions?.filter((c: any) =>
            (typeof c.user === 'string' ? c.user : c.user?._id) === memberId
        ).reduce((sum: number, c: any) => sum + (c.value || 0), 0) || 0;
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">KPI Performance</h1>
                    <p className="text-gray-500">Track team assignments and individual member contributions.</p>
                </div>
                <Button onClick={() => setSheetOpen(true)} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                    <Plus className="w-5 h-5 mr-2" /> Assign New KPI
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
            ) : kpis.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">No Assignments Yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">Start by assigning Key Performance Indicators to your teams or individual users.</p>
                </div>
            ) : (
                <KPITrackingGrid data={kpis} onRefresh={load} />
            )}

            {/* Assignment Sheet */}

            {/* Assignment Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Assign New KPI</SheetTitle>
                    </SheetHeader>
                    <form onSubmit={handleAssign} className="space-y-5 mt-6">
                        <div className="space-y-2">
                            <Label>KPI Title</Label>
                            <Input
                                required
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. Sales Growth"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Target Value</Label>
                                <Input
                                    type="number"
                                    required
                                    value={form.target}
                                    onChange={e => setForm({ ...form, target: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Due Date</Label>
                                <Input
                                    type="date"
                                    required
                                    value={form.dueDate}
                                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Assign Type</Label>
                            <Select
                                value={form.assignType}
                                onValueChange={(v: any) => setForm({ ...form, assignType: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="team">Team Assignment</SelectItem>
                                    <SelectItem value="user">Individual Assignment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {form.assignType === 'team' ? (
                            <div className="space-y-2">
                                <Label>Select Team</Label>
                                <Select
                                    value={form.assignedToTeam}
                                    onValueChange={v => setForm({ ...form, assignedToTeam: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a team" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {teams.map(t => (
                                            <SelectItem key={t._id || t.id} value={t._id || t.id}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>Select User</Label>
                                <Select
                                    value={form.assignedToUser}
                                    onValueChange={v => setForm({ ...form, assignedToUser: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a user" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {users.map(u => <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <SheetFooter>
                            <Button type="submit" className="w-full" disabled={saving}>
                                {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                                Create Assignment
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Contribution Sheet */}
            <Sheet open={contribSheetOpen} onOpenChange={setContribSheetOpen}>
                <SheetContent className="sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Log Contribution</SheetTitle>
                    </SheetHeader>
                    {selectedKpi && (
                        <div className="mt-4 p-4 bg-primary/5 border border-primary/10 rounded-xl">
                            <h4 className="font-bold text-primary">{selectedKpi.title}</h4>
                            <p className="text-xs text-primary/60">{selectedKpi.metric}</p>
                        </div>
                    )}
                    <form onSubmit={handleContribution} className="space-y-5 mt-6">
                        <div className="space-y-2">
                            <Label>Value to Add</Label>
                            <Input
                                type="number"
                                required
                                value={contribForm.value}
                                onChange={e => setContribForm({ ...contribForm, value: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Notes (Optional)</Label>
                            <Input
                                value={contribForm.notes}
                                onChange={e => setContribForm({ ...contribForm, notes: e.target.value })}
                                placeholder="What did you work on?"
                            />
                        </div>
                        <SheetFooter>
                            <Button type="submit" className="w-full" disabled={saving}>
                                {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                                Save Contribution
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
}
