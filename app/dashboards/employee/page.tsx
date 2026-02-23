"use client";

import { Calendar, UserCheck, Briefcase, Bell, Clock, ChevronRight } from 'lucide-react';

export default function EmployeeDashboard() {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-green-600 text-white p-5 rounded-xl shadow-lg gap-4">
                <div>
                    <h1 className="text-xl font-bold">Good Morning, Alex! ☀️</h1>
                    <p className="text-green-100 text-sm mt-1">Here is what is happening today.</p>
                </div>
                <div className="flex items-center gap-3 bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                    <div className="text-right">
                        <p className="text-xs text-green-100">Current Shift</p>
                        <p className="font-mono font-bold">09:00 - 18:00</p>
                    </div>
                    <div className="h-8 w-px bg-white/20"></div>
                    <button className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-white transition-colors">
                        Punch Out
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column (Main Stats) */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center hover:border-green-300 transition-colors cursor-pointer group">
                            <div className="p-3 bg-white text-blue-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900">Attendance</h3>
                            <p className="text-xs text-gray-500">22 / 24 Days</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center hover:border-green-300 transition-colors cursor-pointer group">
                            <div className="p-3 bg-white text-purple-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900">Leave Balance</h3>
                            <p className="text-xs text-gray-500">12 Days Rem.</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center hover:border-green-300 transition-colors cursor-pointer group">
                            <div className="p-3 bg-white text-orange-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                <Bell className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900">Notifications</h3>
                            <p className="text-xs text-gray-500">2 Unread</p>
                        </div>
                    </div>

                    {/* My Tasks */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900">My Assigned Tasks</h3>
                            <button className="text-xs text-green-600 font-medium hover:underline">View All</button>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-gray-100">
                                <input type="checkbox" className="mt-1 rounded text-green-600 focus:ring-green-500" aria-label="Mark Submit Weekly Report as completed" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 line-through text-gray-400">Submit Weekly Report</p>
                                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Completed</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                <input type="checkbox" className="mt-1 rounded text-green-600 focus:ring-green-500" aria-label="Mark Update Client Documentation as completed" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Update Client Documentation</p>
                                    <p className="text-xs text-gray-500 mt-1">Due Today, 5:00 PM</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                <input type="checkbox" className="mt-1 rounded text-green-600 focus:ring-green-500" aria-label="Mark Prepare Presentation Slides as completed" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Prepare Presentation Slides</p>
                                    <p className="text-xs text-gray-500 mt-1">Due Tomorrow</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Sidebar) */}
                <div className="space-y-4">
                    {/* Upcoming Holidays */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-600" />
                            Upcoming Holidays
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-3 items-center">
                                <div className="text-center bg-white p-2 rounded-lg w-12">
                                    <span className="block text-xs font-bold text-gray-500">OCT</span>
                                    <span className="block text-lg font-bold text-gray-900">02</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Gandhi Jayanti</p>
                                    <p className="text-xs text-gray-500">Wednesday</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-center">
                                <div className="text-center bg-white p-2 rounded-lg w-12">
                                    <span className="block text-xs font-bold text-gray-500">NOV</span>
                                    <span className="block text-lg font-bold text-gray-900">01</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Diwali - Deepavali</p>
                                    <p className="text-xs text-gray-500">Friday</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Announcements */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-5 rounded-xl text-white shadow-lg">
                        <h3 className="font-bold text-lg mb-2">Town Hall Meeting</h3>
                        <p className="text-indigo-100 text-sm mb-4">Join us this Friday for the quarterly all-hands meeting.</p>
                        <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
