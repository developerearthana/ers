"use client";

import { Users, Settings, Shield, Globe, Database, ShieldAlert, Server, Activity, Cpu, ArrowUpRight, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAdminDashboardData } from '@/app/actions/admin';
import { getUpcomingAlerts } from '@/app/actions/activity/calendar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        activeUsers: 0,
        securityAlerts: 0,
        systemHealth: "100%",
        serverLoad: "0%"
    });
    const [logs, setLogs] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await getAdminDashboardData();
            if (res.success && res.data) {
                setStats(res.data.stats);
                setLogs(res.data.logs);
            }
            const alertsRes = await getUpcomingAlerts();
            if (alertsRes.success) {
                setAlerts(alertsRes.data);
            }
            setLoading(false);
        };
        load();
    }, []);

    const statConfig = [
        { label: "Active Users", value: stats.activeUsers.toString(), sub: "Total", icon: Users, color: "bg-white", textColor: "text-blue-600", borderColor: "border-border" },
        { label: "System Health", value: stats.systemHealth, sub: "Stable", icon: Activity, color: "bg-white", textColor: "text-green-600", borderColor: "border-border" },
        { label: "Server Load", value: stats.serverLoad, sub: "Optimal", icon: Cpu, color: "bg-white", textColor: "text-purple-600", borderColor: "border-border" },
        { label: "Security Alerts", value: stats.securityAlerts.toString(), sub: stats.securityAlerts > 0 ? "Warning" : "All Clear", icon: ShieldAlert, color: "bg-white", textColor: "text-green-600", borderColor: "border-border" },
    ];

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
                <p className="text-gray-500">Monitor system health and performance.</p>
            </div>

            {/* Alerts Section */}
            {alerts.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                    {alerts.map((alert: any) => (
                        <div key={alert._id || alert.id} className="flex items-center justify-between bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-amber-900 text-sm">{alert.title}</h3>
                                    <p className="text-amber-700 text-xs">
                                        Starting at {format(new Date(alert.start), 'HH:mm')} ({format(new Date(alert.start), 'MMM d')})
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-amber-700 hover:bg-amber-100" onClick={() => setAlerts(prev => prev.filter(a => (a._id || a.id) !== (alert._id || alert.id)))}>
                                Dismiss
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* KPI Cards Standardized */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statConfig.map((stat, idx) => (
                    <div key={idx} className={`glass-card p-5 rounded-xl border ${stat.borderColor} flex flex-col justify-between h-32`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-2 rounded-lg ${stat.color}`}>
                                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3 text-gray-400" />
                            {stat.sub}
                        </p>
                    </div>
                ))}
            </div>

            {/* Quick Access */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a href="/admin/audit" className="glass-card p-4 rounded-xl border border-gray-100 hover:border-primary/50 hover:shadow-md transition-all flex items-center gap-4 group">
                    <div className="p-3 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-100 transition-colors">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Audit & Compliance</h3>
                        <p className="text-xs text-gray-500">View system logs & security</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-primary ml-auto" />
                </a>

                <a href="/admin/audit" className="glass-card p-4 rounded-xl border border-gray-100 hover:border-primary/50 hover:shadow-md transition-all flex items-center gap-4 group col-span-1 md:col-span-3 lg:col-span-1">
                    <div className="p-3 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-100 transition-colors">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Audit & Compliance</h3>
                        <p className="text-xs text-gray-500">View system logs & security</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-primary ml-auto" />
                </a>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-xl border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent System Logs</h3>
                    <div className="space-y-4">
                        {logs.length === 0 && <p className="text-sm text-gray-500">No recent logs.</p>}
                        {logs.map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-background rounded-lg border border-gray-100">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{log.event}</p>
                                    <p className="text-xs text-gray-500">{log.time} • {log.user}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded font-medium
                                    ${log.status === 'Success' ? 'bg-green-100 text-green-700' :
                                        log.status === 'Warning' ? 'bg-orange-100 text-orange-700' :
                                            'bg-blue-100 text-blue-700'}`}>
                                    {log.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-lg">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Server className="w-5 h-5 text-green-400" />
                        Server Status
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-300">CPU Usage</span>
                                <span className="font-bold">34%</span>
                            </div>
                            <div className="h-2 bg-white rounded-full overflow-hidden">
                                <div className="h-full bg-white w-[34%]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-300">Memory Usage</span>
                                <span className="font-bold">62%</span>
                            </div>
                            <div className="h-2 bg-white rounded-full overflow-hidden">
                                <div className="h-full bg-white w-[62%]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-300">Storage</span>
                                <span className="font-bold">28%Used</span>
                            </div>
                            <div className="h-2 bg-white rounded-full overflow-hidden">
                                <div className="h-full bg-white w-[28%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
