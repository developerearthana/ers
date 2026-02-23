"use client";

import { PieChart, Users, Clock, CheckSquare, FileText, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function ManagerDashboard() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-blue-600 text-white p-5 rounded-xl shadow-lg">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-5 h-5 text-blue-200" />
                        <span className="text-sm font-medium text-blue-100">Manager View</span>
                    </div>
                    <h1 className="text-xl font-bold">Team Overview: IT Dept</h1>
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

            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-blue-500" />
                        Team Tasks
                    </h3>
                    <div className="space-y-3">
                        {[
                            { task: 'API Integration for Mobile App', assignee: 'John Doe', status: 'In Progress', color: 'blue' },
                            { task: 'Q1 Security Audit Report', assignee: 'Sarah Smith', status: 'Pending Review', color: 'orange' },
                            { task: 'Update Landing Page UI', assignee: 'Mike Johnson', status: 'Done', color: 'green' },
                        ].map((t, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{t.task}</p>
                                    <p className="text-xs text-gray-500">{t.assignee}</p>
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded bg-${t.color}-100 text-${t.color}-700`}>
                                    {t.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        Recent Activity
                    </h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex gap-3">
                                <div className="w-2 h-2 rounded-full bg-white mt-2 shadow-sm"></div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold text-gray-900">Alice</span> deployed to production.
                                    </p>
                                    <p className="text-xs text-gray-400">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
