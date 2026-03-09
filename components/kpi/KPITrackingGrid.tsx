"use client";

import { useState, useEffect, useCallback } from 'react';
import {
    Target, Plus, Loader2, CheckCircle2, Clock, AlertCircle,
    TrendingUp, Users, User, Trash2, Edit3, History, PlusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
    getAllKPIAssignments,
    getMyKPIAssignments,
    addKPIContribution
} from '@/app/actions/kpi-assignments';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const STATUS_COLORS: Record<string, string> = {
    'Not Started': 'bg-gray-100 text-gray-700 border-gray-200',
    'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
    'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Missed': 'bg-red-50 text-red-700 border-red-200',
};

interface KPITrackingGridProps {
    data?: any[];
    onRefresh?: () => void;
}

export function KPITrackingGrid({ data, onRefresh }: KPITrackingGridProps) {
    const [loading, setLoading] = useState(false);
    const [contribSheetOpen, setContribSheetOpen] = useState(false);
    const [selectedKpi, setSelectedKpi] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [kpis, setKpis] = useState<any[]>(data || []);

    useEffect(() => {
        if (data) setKpis(data);
    }, [data]);

    const [contribForm, setContribForm] = useState({
        value: 0,
        notes: ''
    });

    const load = useCallback(async () => {
        if (onRefresh) {
            onRefresh();
            return;
        }
        setLoading(true);
        try {
            const res = await getMyKPIAssignments();
            if (res.success) setKpis(res.data || []);
        } finally {
            setLoading(false);
        }
    }, [onRefresh]);

    useEffect(() => { load(); }, [load]);

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
            String(typeof c.user === 'string' ? c.user : c.user?._id) === String(memberId)
        ).reduce((sum: number, c: any) => sum + (c.value || 0), 0) || 0;
    };

    const getContributionPercent = (kpi: any, value: number) => {
        const target = Number(kpi.target || 0);
        if (target <= 0) return 0;
        return Math.min(100, (value / target) * 100);
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    if (kpis.length === 0) return (
        <div className="text-center py-12 border-2 border-dashed rounded-2xl">
            <Target className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No KPI assignments tracked yet.</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kpis.map((kpi) => (
                <div key={kpi._id} className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden border-border/50">
                    {/* Card Header */}
                    <div className="p-5 border-b bg-gray-50/50">
                        <div className="flex justify-between items-start mb-3">
                            <div className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border", STATUS_COLORS[kpi.status])}>
                                {kpi.status}
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => { setSelectedKpi(kpi); setContribForm({ value: 0, notes: '' }); setContribSheetOpen(true); }}
                                    className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors border border-primary/20"
                                    title="Add Contribution"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{kpi.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <Target className="w-3.5 h-3.5" />
                            <span>{kpi.metric}</span>
                            <span className="text-gray-300">•</span>
                            <Clock className="w-3.5 h-3.5" />
                            <span>{format(new Date(kpi.dueDate), 'MMM d, yyyy')}</span>
                        </div>
                    </div>

                    {/* Main Stats */}
                    <div className="p-5 flex-grow space-y-4 text-gray-700">
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-gray-500 uppercase tracking-tighter">Overall Progress</span>
                                <span className="text-primary">{kpi.progress}%</span>
                            </div>
                            <Progress value={kpi.progress} className="h-2" />
                            <div className="flex justify-between mt-2 text-[10px] font-medium text-gray-400">
                                <span>Current: {kpi.actual} {kpi.unit}</span>
                                <span>Target: {kpi.target} {kpi.unit}</span>
                            </div>
                        </div>

                        {/* Team/Assignee Section */}
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                                    Performance Tracking
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                {kpi.assignedToTeam ? (
                                    kpi.assignedToTeam.members?.map((member: any) => {
                                        const userId = typeof member === 'string' ? member : member._id;
                                        const userName = typeof member === 'string' ? 'Member' : member.name;
                                        const userImage = typeof member === 'string' ? null : member.image;
                                        const contribValue = getMemberContributions(kpi, userId);
                                        const contribPercent = getContributionPercent(kpi, contribValue);

                                        return (
                                            <div key={userId} className="p-2 rounded-xl bg-gray-50/50 border border-gray-100/50 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-6 h-6 border-white shadow-sm">
                                                        <AvatarImage src={userImage} />
                                                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-bold text-gray-700 text-[11px] truncate">{userName}</span>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-[9px] mb-1">
                                                        <span className="text-emerald-600 font-bold">+{contribValue}</span>
                                                        <span className="text-gray-500 font-semibold">{Math.round(contribPercent)}% contribution</span>
                                                    </div>
                                                    <Progress value={contribPercent} className="h-1" />
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 bg-primary/5 p-3 rounded-xl border border-primary/10">
                                            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                                <AvatarImage src={kpi.assignedToUser?.image} />
                                                <AvatarFallback className="bg-primary text-white">{kpi.assignedToUser?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-sm">{kpi.assignedToUser?.name}</span>
                                                <span className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">{kpi.assignedToUser?.dept} • {kpi.assignedToUser?.role}</span>
                                            </div>
                                        </div>
                                        <div className="px-1">
                                            <div className="flex justify-between text-[10px] font-bold mb-1.5">
                                                <span className="text-gray-400 uppercase">Individual Performance</span>
                                                <span className="text-emerald-600">Total: {kpi.actual} {kpi.unit}</span>
                                            </div>
                                            <Progress value={kpi.progress} className="h-1.5" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity List */}
                        {kpi.contributions?.length > 0 && (
                            <div className="pt-4 border-t border-gray-100">
                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-2">Recent Contributions</span>
                                <div className="space-y-2">
                                    {kpi.contributions.slice(-3).reverse().map((c: any, idx: number) => (
                                        <div key={idx} className="flex items-start gap-2 text-[10px] bg-gray-50/50 p-2 rounded-lg border border-gray-100/50">
                                            <div className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                                                +
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-700">
                                                    {c.user?.name || 'User'}{" "}
                                                    <span className="text-emerald-600">+{c.value}</span>{" "}
                                                    <span className="text-gray-500 font-semibold">
                                                        ({Math.round(getContributionPercent(kpi, Number(c.value || 0)))}%)
                                                    </span>
                                                </p>
                                                <p className="text-gray-400 text-[9px] truncate">{c.notes || 'Progress update'}</p>
                                            </div>
                                            <span className="text-gray-300 whitespace-nowrap">{format(new Date(c.date), 'HH:mm')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Card Footer */}
                    <div className="px-5 py-3 bg-gray-50/30 border-t flex justify-between items-center text-[10px] text-gray-400 font-medium">
                        <div className="flex items-center gap-1">
                            <History className="w-3 h-3" />
                            <span>{kpi.contributions?.length || 0} activity logs</span>
                        </div>
                        <span>Assigned by {kpi.assignedBy?.name || 'Admin'}</span>
                    </div>
                </div>
            ))}

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
