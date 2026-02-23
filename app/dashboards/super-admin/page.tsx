"use client";

import { Activity, Users, DollarSign, ArrowUpRight, ShieldCheck, Server, AlertTriangle, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SuperAdminDashboard() {
    const stats = [
        { label: 'Total Users', value: '1,248', trend: '+12%', color: 'blue', icon: Users },
        { title: 'Total Users', value: '1,248', change: '+12%', color: 'bg-white', textColor: 'text-blue-600', icon: Users },
        { title: 'System Health', value: '98.9%', change: 'Stable', color: 'bg-white', textColor: 'text-green-600', icon: Server },
        { title: 'Monthly Revenue', value: '$84.3k', change: '+8%', color: 'bg-white', textColor: 'text-purple-600', icon: DollarSign },
        { title: 'Critical Risks', value: '3', change: '-2', color: 'bg-red-50', textColor: 'text-red-600', icon: AlertTriangle },
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
                        <p className={`text-xs flex items-center gap-1 font-medium ${(stat.change || '').includes('+') ? 'text-green-600' : stat.change === 'Stable' ? 'text-gray-500' : 'text-red-600'}`}>
                            {stat.change && stat.change !== 'Stable' && <ArrowUpRight className={`w-3 h-3 ${(stat.change || '').includes('-') ? 'rotate-180' : ''}`} />}
                            {stat.change === 'Stable' ? 'Stable' : `${stat.change} vs last month`}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border shadow-sm h-80">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-foreground">System Activity & Traffic</h3>
                        <select
                            className="text-sm border-border rounded-lg p-1.5 bg-background text-foreground"
                            aria-label="Select Time Range"
                        >
                            <option>Last 7 Days</option>
                        </select>
                    </div>
                    <div className="h-full flex items-center justify-center text-gray-400 bg-background rounded-lg border border-dashed border-gray-200">
                        [Chart Visualization Placeholder]
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="font-bold text-foreground mb-4">Critical Alerts</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-3 items-start p-3 bg-red-50 rounded-lg border border-red-100">
                                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-red-900">Database Latency Spike</h4>
                                    <p className="text-xs text-red-700 mt-1">Detected anomaly in US-East region server node.</p>
                                    <span className="text-[10px] text-red-500 mt-2 block font-mono">10 mins ago</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
