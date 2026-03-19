"use client";

import { Activity, Users, DollarSign, ArrowUpRight, ShieldCheck, Server, AlertTriangle, Download, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { getLiveUsers, getLeaves, approveLeave } from "@/app/actions/hrm";
import { toast } from "sonner";
import { format } from "date-fns";
import dynamic from 'next/dynamic';
import { Target } from "lucide-react";
import { getAllKPIAssignments } from "@/app/actions/kpi-assignments";

const KPITrackingGrid = dynamic(() => import('@/components/kpi/KPITrackingGrid').then(m => ({ default: m.KPITrackingGrid })), { ssr: false });

export default function SuperAdminDashboard() {
    const [liveUsers, setLiveUsers] = useState<any[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
    const [loadingLive, setLoadingLive] = useState(true);
    const [kpis, setKpis] = useState<any[]>([]);

    const loadKPIs = useCallback(async () => {
        const res = await getAllKPIAssignments();
        if (res.success) setKpis(res.data || []);
    }, []);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [liveRes, leavesRes] = await Promise.all([
                    getLiveUsers(),
                    getLeaves()
                ]);

                if (liveRes.success && liveRes.data) {
                    setLiveUsers(liveRes.data);
                }

                if (leavesRes.success && leavesRes.data) {
                    setLeaveRequests(leavesRes.data.filter((r: any) => r.status === 'Pending'));
                }

                // Load KPIs using the stabilized callback
                await loadKPIs();
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoadingLive(false);
            }
        };

        loadDashboardData();
        // Optional: setup a simple polling for live users every minute
        const interval = setInterval(loadDashboardData, 60000);
        return () => clearInterval(interval);
    }, [loadKPIs]);

    const handleApproveLeave = async (id: string, action: 'Approved' | 'Rejected') => {
        try {
            const res = await approveLeave(id, action);
            if (res.success) {
                toast.success(`Request ${action}`);
                setLeaveRequests(prev => prev.filter(r => r._id !== id));
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const stats = [
        { title: 'Total Users', value: '1,248', change: '+12%', color: 'bg-white', textColor: 'text-blue-600', icon: Users },
        { title: 'Live Staff', value: liveUsers.length.toString(), change: 'Live', color: 'bg-emerald-50', textColor: 'text-emerald-600', icon: Clock },
        { title: 'Monthly Revenue', value: '$84.3k', change: '+8%', color: 'bg-white', textColor: 'text-purple-600', icon: DollarSign },
        { title: 'Pending Leaves', value: leaveRequests.length.toString(), change: 'Requires Action', color: 'bg-amber-50', textColor: 'text-amber-600', icon: AlertTriangle },
    ];

    return (
        <div className="space-y-4 p-4">
            <div className="flex justify-between items-center bg-card p-4 rounded-xl shadow-sm border border-border">
                <div>
                    <h1 className="text-2xl font-bold text-primary">
                        Super Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground text-sm">Welcome back, Administrator</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className={`glass-card p-5 rounded-xl border ${stat.color.replace('bg-', 'border-').replace('-50', '-100')} flex flex-col justify-between h-32`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-foreground mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-2 rounded-lg bg-muted`}>
                                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                            </div>
                        </div>
                        <p className={`text-xs flex items-center gap-1 font-medium ${(stat.change || '').includes('+') ? 'text-green-600' : (stat.change || '').includes('-') ? 'text-red-600' : stat.change === 'Stable' ? 'text-gray-500' : 'text-blue-600'}`}>
                            {stat.change && (stat.change.includes('+') || stat.change.includes('-')) && <ArrowUpRight className={`w-3 h-3 ${stat.change.includes('-') ? 'rotate-180' : ''}`} />}
                            {!stat.change || stat.change === 'Stable' || !stat.change.includes('%') ? (stat.change || '') : `${stat.change} vs last month`}
                        </p>
                    </div>
                ))}
            </div>

            <div className="lg:col-span-2 space-y-6">
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-foreground">System Activity & Traffic</h3>
                        <select
                            className="text-sm border-border rounded-lg p-1.5 bg-background text-foreground"
                            aria-label="Select Time Range"
                        >
                            <option>Last 7 Days</option>
                        </select>
                    </div>
                    <div className="h-40 flex items-center justify-center text-gray-400 bg-background rounded-lg border border-dashed border-gray-200">
                        [Chart Visualization Placeholder]
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            Live Staff Tracking
                        </h3>
                        <div className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-1 rounded-full">
                            {liveUsers.length} Online Now
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {loadingLive ? (
                            <p className="text-sm text-gray-500 col-span-3">Syncing live data...</p>
                        ) : liveUsers.length === 0 ? (
                            <p className="text-sm text-gray-500 col-span-3">No staff members are currently logged in/punched in.</p>
                        ) : (
                            liveUsers.map((record: any) => (
                                <div key={record._id} className="flex items-center gap-3 p-3 border border-emerald-100 bg-emerald-50/30 rounded-lg">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-300 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
                                        {record.userId?.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">{record.userId?.name || 'Unknown'}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            In since {format(new Date(record.punchIn), 'HH:mm')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* KPI Performance Section */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <Target className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">KPI Operation Status</h3>
                            <p className="text-xs text-muted-foreground">Team performance & individual contributions</p>
                        </div>
                    </div>
                </div>
                <KPITrackingGrid data={kpis} onRefresh={loadKPIs} />
            </div>

            <div className="space-y-6">
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex-1">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-foreground">Pending Leaves</h3>
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">{leaveRequests.length}</span>
                    </div>
                    <div className="space-y-3">
                        {leaveRequests.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed">No pending requests</p>
                        ) : (
                            leaveRequests.slice(0, 5).map(req => (
                                <div key={req._id} className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-bold text-gray-900">{req.userName}</span>
                                        <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{req.type}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-3 font-medium">
                                        {format(new Date(req.startDate), 'MMM d')} - {format(new Date(req.endDate), 'MMM d, yyyy')}
                                    </p>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleApproveLeave(req._id, 'Approved')} className="flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                        </button>
                                        <button onClick={() => handleApproveLeave(req._id, 'Rejected')} className="flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
                                            <XCircle className="w-3.5 h-3.5" /> Deny
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
