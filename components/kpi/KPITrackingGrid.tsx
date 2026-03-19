"use client";

import { useState, useEffect, useCallback } from 'react';
import {
    Target, Plus, Loader2, CheckCircle2, Clock, AlertCircle,
    TrendingUp, Users, User, Trash2, Edit3, History, PlusCircle, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
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

    const [expandedKpis, setExpandedKpis] = useState<string[]>([]);
    const [expandedProgress, setExpandedProgress] = useState<string[]>([]);

    const toggleKpi = (id: string) => {
        setExpandedKpis(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleProgress = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedProgress(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const [contribForm, setContribForm] = useState({
        value: 0,
        notes: ''
    });

    const load = useCallback(async () => {
        // If parent handles refresh, don't trigger it automatically on mount
        // Parent should manage the initial data fetch.
        if (onRefresh) {
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

    useEffect(() => { 
        if (!data || data.length === 0) {
            load(); 
        }
    }, [load, data]);

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
                <div 
                    key={kpi._id}
                    className="bg-white border rounded-2xl p-5 shadow-sm hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => toggleKpi(kpi._id)}
                >
                    {/* Always visible header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="pr-4">
                            <h3 className="font-bold text-gray-900 text-lg line-clamp-2 leading-tight">{kpi.title}</h3>
                            <p className="text-xs text-gray-500 mt-1.5 font-medium">{kpi.metric}</p>
                        </div>
                        <div className={cn("px-2.5 py-1 whitespace-nowrap rounded-lg text-[10px] font-bold uppercase tracking-wider border", STATUS_COLORS[kpi.status])}>
                            {kpi.status}
                        </div>
                    </div>
                    
                    {/* Always visible Progress */}
                    <div>
                        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                            <span className="text-gray-400 uppercase tracking-wide">Overall Progress</span>
                            <span className="text-primary">{kpi.progress}%</span>
                        </div>
                        <Progress value={kpi.progress} className="h-2" />
                    </div>

                    {/* Expanded Team Members View */}
                    {expandedKpis.includes(kpi._id) && (
                        <div className="mt-5 pt-5 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                                    Team Contributions
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedKpi(kpi); setContribForm({ value: 0, notes: '' }); setContribSheetOpen(true); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-xs font-bold"
                                >
                                    <PlusCircle className="w-3.5 h-3.5" /> Log Update
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                {kpi.assignedToTeam ? (
                                    kpi.assignedToTeam.members?.map((member: any) => {
                                        const userId = typeof member === 'string' ? member : member._id;
                                        const userName = typeof member === 'string' ? 'Member' : member.name;
                                        const contribValue = getMemberContributions(kpi, userId);
                                        const contribPercent = getContributionPercent(kpi, contribValue);
                                        
                                        return (
                                            <div key={userId} className="flex justify-between items-center text-sm py-1">
                                                <span className="font-semibold text-gray-700">{userName}</span>
                                                <span className="text-emerald-600 text-xs font-black bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">{Math.round(contribPercent)}%</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex justify-between items-center text-sm py-1">
                                        <span className="font-semibold text-gray-700">{kpi.assignedToUser?.name || 'User'}</span>
                                        <span className="text-emerald-600 text-xs font-black bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">{Math.round(getContributionPercent(kpi, kpi.actual))}%</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* Contribution Sheet */}
            <Sheet open={contribSheetOpen} onOpenChange={setContribSheetOpen}>
                <SheetContent className="sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Log Contribution</SheetTitle>
                        <SheetDescription>Record your progress update for this KPI assignment.</SheetDescription>
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
