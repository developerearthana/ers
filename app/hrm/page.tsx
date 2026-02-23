"use client";

import { Users, UserCheck, CalendarDays, Cake, ArrowUpRight, Loader2 } from 'lucide-react';
import { AttendanceHeatmap } from '@/components/hrm/AttendanceHeatmap';
import { PageWrapper, CardWrapper } from '@/components/ui/page-wrapper';
import { useState, useEffect } from 'react';
import { getHRMDashboardStats } from '@/app/actions/hrm';
import { toast } from 'sonner';

export default function HRMDashboard() {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        onLeaveToday: 0,
        checkedInToday: 0,
        newJoiners: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const res = await getHRMDashboardStats();
            if (res.success && res.data) {
                setStats(res.data);
            }
        } catch (error) {
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const upcomingBirthdays = [
        { id: 1, name: "Rahul Sharma", date: "26 Mar", role: "Sales Manager" },
        { id: 2, name: "Priya Singh", date: "2 Apr", role: "Developer" },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <PageWrapper className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-primary tracking-tight">HR Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage your workforce, attendance and payroll.</p>
            </div>

            {/* Stats Grid Standardized */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Total Employees", value: stats.totalEmployees, desc: "Active Staff", icon: Users, color: "bg-muted", textColor: "text-primary", border: "border-border" },
                    { label: "On Leave Today", value: stats.onLeaveToday, desc: "Sick / Paid Leave", icon: CalendarDays, color: "bg-muted", textColor: "text-secondary-foreground", border: "border-border" },
                    { label: "Check-in", value: stats.checkedInToday, desc: "Present Today", icon: UserCheck, color: "bg-muted", textColor: "text-primary", border: "border-border" },
                    { label: "New Joiners", value: stats.newJoiners, desc: "This Month", icon: ArrowUpRight, color: "bg-muted", textColor: "text-secondary-foreground", border: "border-border" },
                ].map((stat, idx) => (
                    <CardWrapper key={idx} delay={idx * 0.1} className={`glass-card p-5 rounded-xl border ${stat.border} flex flex-col justify-between h-32 hover:shadow-md transition-all`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-foreground mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-2 rounded-lg ${stat.color}`}>
                                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            {stat.icon === ArrowUpRight ? <ArrowUpRight className="w-3 h-3 text-green-500" /> : null}
                            {stat.desc}
                        </p>
                    </CardWrapper>
                ))}
            </div>

            <CardWrapper delay={0.4}>
                <AttendanceHeatmap />
            </CardWrapper>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recruitment Pipeline Placeholder */}
                <CardWrapper delay={0.5} className="lg:col-span-2 glass-card p-6 rounded-xl border border-border">
                    <h3 className="text-lg font-bold text-foreground mb-6">Recruitment Pipeline</h3>
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="p-4 rounded-lg bg-card border border-border hover:bg-primary/5 transition-colors cursor-pointer group">
                            <div className="text-2xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform">12</div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase">Applied</div>
                        </div>
                        <div className="p-4 rounded-lg bg-card border border-border hover:bg-primary/5 transition-colors cursor-pointer group">
                            <div className="text-2xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform">5</div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase">Screening</div>
                        </div>
                        <div className="p-4 rounded-lg bg-card border border-border hover:bg-primary/5 transition-colors cursor-pointer group">
                            <div className="text-2xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform">3</div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase">Interview</div>
                        </div>
                        <div className="p-4 rounded-lg bg-card border border-border hover:bg-primary/5 transition-colors cursor-pointer group">
                            <div className="text-2xl font-bold text-secondary-foreground mb-1 group-hover:scale-110 transition-transform">1</div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase">Offer</div>
                        </div>
                    </div>
                </CardWrapper>

                {/* Upcoming Events / Birthdays */}
                <CardWrapper delay={0.6} className="glass-card p-6 rounded-xl border border-border">
                    <h3 className="text-lg font-bold text-foreground mb-6">Upcoming Events</h3>
                    <div className="space-y-4">
                        {upcomingBirthdays.map((bday) => (
                            <div key={bday.id} className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors">
                                <div className="p-2 bg-muted text-primary rounded-lg">
                                    <Cake className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground text-sm">{bday.name}</p>
                                    <p className="text-xs text-muted-foreground">{bday.role} • {bday.date}</p>
                                </div>
                            </div>
                        ))}
                        <div className="p-3 rounded-lg border border-dashed border-border text-center text-xs text-muted-foreground">
                            No other events this week
                        </div>
                    </div>
                </CardWrapper>
            </div>
        </PageWrapper>
    );
}
