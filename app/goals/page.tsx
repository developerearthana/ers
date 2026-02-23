"use client";

import { Target, BarChart2, CalendarDays, ArrowUpRight, CheckCircle2, Clock, Filter } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';

export default function GoalsDashboard() {
    const [selectedSubsidiary, setSelectedSubsidiary] = useState("All");
    const [selectedPeriod, setSelectedPeriod] = useState("Q4 FY25-26");

    const subsidiaries = ["All", "Rudra Architectural Studio (RAS)", "Gridwise", "Metrum Works", "Rite Hands"];
    const periods = ["Q4 FY25-26", "FY26-27 Summary", "Q1 FY26-27", "Q2 FY26-27", "Q3 FY26-27", "Q4 FY26-27"];

    // Mock Data Store by Period
    const PERIOD_GOALS: Record<string, any[]> = {
        "Q4 FY25-26": [
            { id: 1, title: "Achieve ₹2Cr Revenue", target: "₹2,00,00,000", current: "₹1,45,00,000", progress: 72, status: "On Track", subsidiary: "Rudra Architectural Studio (RAS)" },
            { id: 2, title: "Launch 3 New Products", target: "3", current: "1", progress: 33, status: "Behind", subsidiary: "Metrum Works" },
            { id: 3, title: "Reduce OpEx by 15%", target: "15%", current: "8%", progress: 53, status: "At Risk", subsidiary: "Gridwise" },
            { id: 4, title: "Expand Agent Network", target: "50 Agents", current: "45 Agents", progress: 90, status: "On Track", subsidiary: "Rite Hands" },
            { id: 5, title: "Complete Factory Audit", target: "100%", current: "60%", progress: 60, status: "On Track", subsidiary: "Gridwise" },
        ],
        "FY26-27 Summary": [
            { id: 101, title: "Group Annual Revenue ₹10Cr", target: "₹10Cr", current: "₹0", progress: 0, status: "On Track", subsidiary: "All" },
            { id: 102, title: "Enter North India Market", target: "5 Cities", current: "0", progress: 0, status: "On Track", subsidiary: "Rite Hands" },
            { id: 103, title: "ISO 9001 Certification", target: "Certified", current: "Initiated", progress: 10, status: "On Track", subsidiary: "Gridwise" },
        ],
        "Q1 FY26-27": [
            { id: 201, title: "Q1 Revenue Target", target: "₹2.2Cr", current: "₹0", progress: 0, status: "On Track", subsidiary: "Rudra Architectural Studio (RAS)" },
            { id: 202, title: "Hire Regional Managers", target: "3", current: "0", progress: 0, status: "On Track", subsidiary: "Rite Hands" },
        ],
        "Q2 FY26-27": [
            { id: 301, title: "Q2 Revenue Target", target: "₹2.5Cr", current: "₹0", progress: 0, status: "On Track", subsidiary: "Rudra Architectural Studio (RAS)" },
            { id: 302, title: "Launch Mobile App v2.0", target: "Live", current: "Dev", progress: 0, status: "On Track", subsidiary: "Metrum Works" },
        ],
        "Q3 FY26-27": [
            { id: 401, title: "Q3 Revenue Target", target: "₹2.8Cr", current: "₹0", progress: 0, status: "On Track", subsidiary: "All" },
        ],
        "Q4 FY26-27": [
            { id: 501, title: "Q4 Revenue Target", target: "₹3.0Cr", current: "₹0", progress: 0, status: "On Track", subsidiary: "All" },
        ]
    };

    const currentGoals = PERIOD_GOALS[selectedPeriod] || [];

    const filteredGoals = selectedSubsidiary === "All"
        ? currentGoals
        : currentGoals.filter(g => g.subsidiary === selectedSubsidiary || g.subsidiary === "All");

    const onTrackCount = filteredGoals.filter(g => g.status === "On Track").length;
    const progressAvg = filteredGoals.length > 0 ? Math.round(filteredGoals.reduce((acc, curr) => acc + curr.progress, 0) / filteredGoals.length) : 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedPeriod} Goals & Performance</h2>
                    <p className="text-muted-foreground">Track strategic objectives and key performance indicators.</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative">
                        <select
                            aria-label="Filter by Period"
                            className="pl-3 pr-8 py-2 border border-border rounded-lg text-sm bg-card text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                        >
                            {periods.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative">
                        <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <select
                            aria-label="Filter by Subsidiary"
                            className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                            value={selectedSubsidiary}
                            onChange={(e) => setSelectedSubsidiary(e.target.value)}
                        >
                            {subsidiaries.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                    <Link href="/goals/plan" className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-muted transition-colors">
                        <Target className="w-4 h-4" />
                        Plan
                    </Link>
                    <Link href="/goals/kpi" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors shadow-sm">
                        <ArrowUpRight className="w-4 h-4" />
                        KPI Update
                    </Link>
                </div>
            </div>

            {/* Quick Stats Standardized */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-5 rounded-xl border border-border flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Overall Progress</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">{progressAvg}%</h3>
                        </div>
                        <div className="p-2 bg-muted rounded-lg">
                            <Target className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <p className="text-xs text-secondary-foreground flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> Avg. Completion
                    </p>
                </div>

                <div className="glass-card p-5 rounded-xl border border-border flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Current Period</p>
                            <h3 className="text-xl font-bold text-foreground mt-1 truncate">{selectedPeriod}</h3>
                        </div>
                        <div className="p-2 bg-muted rounded-lg">
                            <CalendarDays className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Active Cycle</p>
                </div>

                <div className="glass-card p-5 rounded-xl border border-border flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Goals On Track</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">{onTrackCount}/{filteredGoals.length}</h3>
                        </div>
                        <div className="p-2 bg-muted rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-secondary-foreground" />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Strategic Objectives</p>
                </div>
            </div>

            {/* Strategic Goals List */}
            <div className="glass-card rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h3 className="font-bold text-foreground">Strategic Objectives {selectedSubsidiary !== 'All' && `for ${selectedSubsidiary}`}</h3>
                    <Link href="/goals/plan" className="text-sm text-primary font-medium hover:opacity-80">View Details</Link>
                </div>
                <div className="divide-y divide-gray-100">
                    {filteredGoals.map((goal) => {
                        return (
                            <div key={goal.id} className="p-6 hover:bg-background/50 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{goal.subsidiary}</span>
                                        </div>
                                        <h4 className="font-semibold text-foreground">{goal.title}</h4>
                                        <p className="text-sm text-muted-foreground mt-1">Target: {goal.target} • Current: {goal.current}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border w-fit
                                    ${goal.status === 'On Track' ? 'bg-muted text-secondary-foreground border-border' :
                                            goal.status === 'Behind' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                                                'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                                        {goal.status}
                                    </span>
                                </div>
                                <div className="w-full">
                                    <Progress
                                        value={goal.progress}
                                        indicatorClassName={goal.progress >= 70 ? 'bg-white0' : goal.progress >= 40 ? 'bg-yellow-500' : 'bg-red-500'}
                                        aria-label={`Progress: ${goal.progress}%`}
                                    />
                                </div>
                            </div>
                        );
                    })}
                    {filteredGoals.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            No goals found for this period/subsidiary.
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Reviews & KPIs */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-foreground">Recent Review Meetings</h3>
                        <Link href="/goals/review" className="text-sm text-primary font-medium hover:opacity-80">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-lg border border-border bg-muted/30">
                                <div className="bg-card text-primary p-2 rounded-lg h-fit border border-border">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-foreground">Q1 Mid-Quarter Review</h4>
                                    <p className="text-xs text-muted-foreground mt-1">Feb 15, 2026 • Guided by Rajesh Sharma</p>
                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">Discussed potential blockers in the Gridwise factory optimization project...</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-foreground">Weekly KPI Snapshot</h3>
                        <Link href="/goals/kpi" className="text-sm text-primary font-medium hover:opacity-80">View Report</Link>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                            <span className="text-sm font-medium text-foreground">Sales Conversion Rate</span>
                            <span className="font-bold text-secondary-foreground">22% <span className="text-xs font-normal">vs 18% target</span></span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <span className="text-sm font-medium text-red-600">Customer Churn</span>
                            <span className="font-bold text-red-700">5.2% <span className="text-xs font-normal">vs 3% target</span></span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                            <span className="text-sm font-medium text-foreground">Project Delivery On-Time</span>
                            <span className="font-bold text-primary">94% <span className="text-xs font-normal">vs 90% target</span></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
