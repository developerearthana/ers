"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, Clock, FileText, TrendingUp, ArrowUpRight, CheckSquare, Target, Loader2, Bell, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUpcomingAlerts } from "@/app/actions/activity/calendar";
import { format, isToday } from "date-fns";
import MyKPIs from "@/components/kpi/MyKPIs";
import { getTeams } from "@/app/actions/organization";
import { getMyKPIAssignments } from "@/app/actions/kpi-assignments";
import { punchIn, punchOut, getAttendance } from "@/app/actions/hrm";
import { toast } from "sonner";

type TeamType = {
    _id?: string;
    id?: string;
    name: string;
    members?: Array<{ _id?: string; id?: string; name?: string }>;
};

type KPIType = {
    _id: string;
    assignedToTeam?: { _id?: string; id?: string; name?: string };
    assignedToUser?: { _id?: string; id?: string; name?: string };
    actual?: number;
    contributions?: Array<{ user?: { _id?: string; id?: string; name?: string } | string; value?: number }>;
    title?: string;
};

export default function ManagerDashboard() {
    const [teams, setTeams] = useState<TeamType[]>([]);
    const [kpis, setKpis] = useState<KPIType[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPunchedIn, setIsPunchedIn] = useState(false);
    const [punchTime, setPunchTime] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [teamsRes, kpisRes, alertsRes] = await Promise.all([
                getTeams(),
                getMyKPIAssignments(),
                getUpcomingAlerts()
            ]);
            setTeams((teamsRes || []) as TeamType[]);
            if (kpisRes.success) setKpis((kpisRes.data || []) as KPIType[]);
            if (alertsRes.success) setAlerts(alertsRes.data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
        const loadAttendance = async () => {
            try {
                const now = new Date();
                const attRes = await getAttendance(undefined, now.getMonth(), now.getFullYear());
                if (attRes.success && attRes.data) {
                    const todayRec = attRes.data.find((r: any) => isToday(new Date(r.date)));
                    if (todayRec?.punchIn && !todayRec?.punchOut) {
                        setIsPunchedIn(true);
                        setPunchTime(format(new Date(todayRec.punchIn), 'HH:mm'));
                    }
                }
            } catch (e) { console.warn('Attendance load failed', e); }
        };
        loadAttendance();
    }, [load]);

    const handlePunch = async () => {
        setActionLoading(true);
        try {
            if (!isPunchedIn) {
                const res = await punchIn();
                if (res.success) {
                    setIsPunchedIn(true);
                    setPunchTime(format(new Date(res.data.punchIn), 'HH:mm'));
                    toast.success('Punched in successfully!');
                } else {
                    toast.error(res.error || 'Punch in failed');
                }
            } else {
                const res = await punchOut();
                if (res.success) {
                    setIsPunchedIn(false);
                    setPunchTime(null);
                    toast.success('Punched out successfully!');
                } else {
                    toast.error(res.error || 'Punch out failed');
                }
            }
        } catch {
            toast.error('An error occurred');
        } finally {
            setActionLoading(false);
        }
    };

    const teamStats = useMemo(() => {
        return teams.map((team) => {
            const teamId = String(team._id || team.id || "");
            const memberIds = (team.members || []).map((m) => String(m._id || m.id || ""));

            const teamKpis = kpis.filter((kpi) => {
                const assignedTeamId = String(kpi.assignedToTeam?._id || kpi.assignedToTeam?.id || "");
                const assignedUserId = String(kpi.assignedToUser?._id || kpi.assignedToUser?.id || "");
                return assignedTeamId === teamId || (assignedUserId && memberIds.includes(assignedUserId));
            });

            const workDone = teamKpis.reduce((sum, kpi) => sum + (kpi.actual || 0), 0);

            const memberContributions = (team.members || []).map((member) => {
                const memberId = String(member._id || member.id || "");
                const contribution = teamKpis.reduce((sum, kpi) => {
                    const memberTotal = (kpi.contributions || [])
                        .filter((c) => String(typeof c.user === "string" ? c.user : c.user?._id || c.user?.id) === memberId)
                        .reduce((total, c) => total + (c.value || 0), 0);
                    return sum + memberTotal;
                }, 0);

                return {
                    id: memberId,
                    name: member.name || "Member",
                    contribution,
                };
            });

            return {
                id: teamId,
                name: team.name,
                kpiCount: teamKpis.length,
                workDone,
                memberContributions,
            };
        });
    }, [teams, kpis]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 bg-blue-600 text-white p-4 md:p-5 rounded-xl shadow-lg">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-5 h-5 text-blue-200" />
                        <span className="text-sm font-medium text-blue-100">Manager View</span>
                    </div>
                    <h1 className="text-xl font-bold">Team Overview</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/masters/kpi-assignments"
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white text-blue-700 text-sm font-semibold hover:bg-blue-50 transition-colors"
                    >
                        <Target className="w-4 h-4" />
                        KPI Assignment
                    </Link>
                    <div className="flex items-center gap-3 bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                        {punchTime && (
                            <div className="text-right hidden md:block">
                                <p className="text-xs text-blue-100">Punched in at</p>
                                <p className="font-mono font-bold">{punchTime}</p>
                            </div>
                        )}
                        {punchTime && <div className="h-8 w-px bg-white/20 hidden md:block" />}
                        <button
                            onClick={handlePunch}
                            disabled={actionLoading}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors ${isPunchedIn
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-white text-blue-700 hover:bg-blue-50'
                                } disabled:opacity-60`}
                        >
                            {actionLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isPunchedIn ? (
                                <><LogOut className="w-4 h-4" /> Punch Out</>
                            ) : (
                                <><LogIn className="w-4 h-4" /> Punch In</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-white text-blue-600 rounded-lg">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Today's Attendance</p>
                            <h3 className="text-xl font-bold text-gray-900">18 / 20</h3>
                        </div>
                    </div>
                    <div className="w-full bg-white rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full w-[90%]"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">2 members ooo (Sick Leave)</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-white text-orange-600 rounded-lg">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pending Approvals</p>
                            <h3 className="text-xl font-bold text-gray-900">5</h3>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">3 Leaves</button>
                        <button className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">2 Expenses</button>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-white text-green-600 rounded-lg">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Project Velocity</p>
                            <h3 className="text-xl font-bold text-gray-900">104%</h3>
                        </div>
                    </div>
                    <p className="text-xs text-green-600 flex items-center gap-1 font-medium">
                        <ArrowUpRight className="w-3 h-3" /> 4% higher than last sprint
                    </p>
                </div>
            </div>

            <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-500" />
                    KPI Assignment Grid
                </h3>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-7 h-7 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {teamStats.map((team) => (
                            <div key={team.id} className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-gray-900">{team.name}</h4>
                                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                                        {team.kpiCount} KPIs
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 mb-3">Work Done: {team.workDone}</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {team.memberContributions.length > 0 ? (
                                        team.memberContributions.map((member) => (
                                            <div key={member.id} className="bg-white rounded-lg border border-gray-200 p-2.5">
                                                <p className="text-xs font-semibold text-gray-800 truncate">{member.name}</p>
                                                <p className="text-[11px] text-emerald-700 font-bold">Contribution: {member.contribution}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-500">No team members found.</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-6">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="font-bold text-gray-900 text-lg">My Targets & KPIs</h3>
                </div>
                <MyKPIs />
            </div>
        </div>
    );
}

