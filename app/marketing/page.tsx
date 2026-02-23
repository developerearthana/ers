"use client";

import { BarChart3, TrendingUp, Users, Target } from 'lucide-react';

export default function MarketingDashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Marketing Overview</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5 rounded-xl border border-border flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Budget</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">₹50.0 L</h3>
                        </div>
                        <div className="p-2 bg-white rounded-lg">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +12% vs last month
                    </p>
                </div>

                <div className="glass-card p-5 rounded-xl border border-border flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Active Campaigns</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">8</h3>
                        </div>
                        <div className="p-2 bg-white rounded-lg">
                            <Target className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">3 ending this week</p>
                </div>

                <div className="glass-card p-5 rounded-xl border border-border flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Reach</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">1.2 M</h3>
                        </div>
                        <div className="p-2 bg-white rounded-lg">
                            <Users className="w-5 h-5 text-orange-600" />
                        </div>
                    </div>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +5.4% organic growth
                    </p>
                </div>

                <div className="glass-card p-5 rounded-xl border border-border flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Avg. ROI</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">3.5x</h3>
                        </div>
                        <div className="p-2 bg-white rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Across all channels</p>
                </div>
            </div>

            {/* Campaign Performance Chart Placeholder */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 glass-card p-6 rounded-xl border border-gray-100 h-[300px] flex flex-col">
                    <h3 className="font-bold text-gray-900 mb-4">Campaign Performance</h3>
                    <div className="flex-1 bg-background rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                        <p className="text-sm text-gray-400">Chart Visualization Placeholder</p>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-xl border border-gray-100 h-[300px] flex flex-col">
                    <h3 className="font-bold text-gray-900 mb-4">Budget Allocation</h3>
                    <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Digital Ads</span>
                                <span className="font-medium text-gray-900">45%</span>
                            </div>
                            <div className="h-2 bg-white rounded-full overflow-hidden">
                                <div className="h-full bg-white0 w-[45%]"></div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Events</span>
                                <span className="font-medium text-gray-900">30%</span>
                            </div>
                            <div className="h-2 bg-white rounded-full overflow-hidden">
                                <div className="h-full bg-white0 w-[30%]"></div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Content</span>
                                <span className="font-medium text-gray-900">15%</span>
                            </div>
                            <div className="h-2 bg-white rounded-full overflow-hidden">
                                <div className="h-full bg-white0 w-[15%]"></div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Social</span>
                                <span className="font-medium text-gray-900">10%</span>
                            </div>
                            <div className="h-2 bg-white rounded-full overflow-hidden">
                                <div className="h-full bg-white0 w-[10%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
