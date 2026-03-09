"use client";

import { Calendar, UserCheck, Briefcase, Bell, Clock, ChevronRight, LogIn, LogOut, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { punchIn, punchOut, getAttendance, getLeaves } from '@/app/actions/hrm';
import { toast } from 'sonner';
import { isToday, format } from 'date-fns';
import Link from 'next/link';
import MyKPIs from '@/components/kpi/MyKPIs';

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
}

export default function EmployeeDashboard() {
    const { data: session } = useSession();
    const userName = session?.user?.name || 'Employee';
    const firstName = userName.split(' ')[0];

    const [isPunchedIn, setIsPunchedIn] = useState(false);
    const [punchTime, setPunchTime] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [myLeaves, setMyLeaves] = useState<any[]>([]);
    const [attendanceCount, setAttendanceCount] = useState({ present: 0, total: 0 });

    // Load on mount — server actions read session from server side, no need to gate here
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const now = new Date();
            const [attRes, leavesRes] = await Promise.all([
                getAttendance(undefined, now.getMonth(), now.getFullYear()),
                getLeaves()
            ]);

            if (attRes.success && attRes.data) {
                const todayRec = attRes.data.find((r: any) => isToday(new Date(r.date)));
                if (todayRec?.punchIn && !todayRec?.punchOut) {
                    setIsPunchedIn(true);
                    setPunchTime(format(new Date(todayRec.punchIn), 'HH:mm'));
                } else {
                    setIsPunchedIn(false);
                    setPunchTime(null);
                }
                const presentDays = attRes.data.filter((r: any) => r.status === 'Present' || r.punchIn).length;
                setAttendanceCount({ present: presentDays, total: attRes.data.length });
            }

            if (leavesRes.success && leavesRes.data) {
                setMyLeaves(leavesRes.data.slice(0, 3));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePunch = async () => {
        setActionLoading(true);
        try {
            if (!isPunchedIn) {
                const res = await punchIn();
                if (res.success) {
                    setIsPunchedIn(true);
                    setPunchTime(format(new Date(res.data.punchIn), 'HH:mm'));
                    toast.success('Punched in successfully! ✅');
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
        } catch (e) {
            toast.error('An error occurred');
        } finally {
            setActionLoading(false);
        }
    };

    const statusColors: Record<string, string> = {
        Approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        Pending: 'bg-amber-100 text-amber-700 border-amber-200',
        Rejected: 'bg-red-100 text-red-700 border-red-200',
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-green-600 to-emerald-500 text-white p-5 rounded-xl shadow-lg gap-4">
                <div>
                    <h1 className="text-xl font-bold">
                        {getGreeting()}, {firstName}! {new Date().getHours() < 12 ? '☀️' : new Date().getHours() < 17 ? '🌤️' : '🌙'}
                    </h1>
                    <p className="text-green-100 text-sm mt-1">Here is what is happening today.</p>
                </div>
                <div className="flex items-center gap-3 bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                    {punchTime && (
                        <div className="text-right hidden md:block">
                            <p className="text-xs text-green-100">Punched in at</p>
                            <p className="font-mono font-bold">{punchTime}</p>
                        </div>
                    )}
                    {punchTime && <div className="h-8 w-px bg-white/20 hidden md:block" />}
                    <button
                        onClick={handlePunch}
                        disabled={actionLoading || isLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors ${isPunchedIn
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-white text-green-700 hover:bg-green-50'
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Link href="/hrm/attendance" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center hover:border-green-300 transition-colors cursor-pointer group">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900">Attendance</h3>
                            <p className="text-xs text-gray-500">
                                {isLoading ? '...' : `${attendanceCount.present} Days This Month`}
                            </p>
                        </Link>
                        <Link href="/hrm/leave" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center hover:border-green-300 transition-colors cursor-pointer group">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900">Leave</h3>
                            <p className="text-xs text-gray-500">Apply / View Status</p>
                        </Link>
                        <Link href="/hrm/documents" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center hover:border-green-300 transition-colors cursor-pointer group">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                <Bell className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900">My Documents</h3>
                            <p className="text-xs text-gray-500">View & Upload</p>
                        </Link>
                    </div>

                    {/* Recent Leave Requests */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900">My Leave Requests</h3>
                            <Link href="/hrm/leave" className="text-xs text-green-600 font-medium hover:underline flex items-center gap-1">
                                View All <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                        {isLoading ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                            </div>
                        ) : myLeaves.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-lg border border-dashed">No leave requests yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {myLeaves.map((req: any) => (
                                    <div key={req._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{req.type} Leave</p>
                                            <p className="text-xs text-gray-500">
                                                {format(new Date(req.startDate), 'dd MMM')} – {format(new Date(req.endDate), 'dd MMM yyyy')}
                                            </p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[req.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* My KPIs Section */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="font-bold text-gray-900 text-lg">My Targets & KPIs</h3>
                        </div>
                        <MyKPIs />
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    {/* Upcoming Holidays */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-600" />
                            Upcoming Holidays
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-3 items-center">
                                <div className="text-center bg-green-50 p-2 rounded-lg w-12">
                                    <span className="block text-xs font-bold text-gray-500">OCT</span>
                                    <span className="block text-lg font-bold text-gray-900">02</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Gandhi Jayanti</p>
                                    <p className="text-xs text-gray-500">Wednesday</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-center">
                                <div className="text-center bg-green-50 p-2 rounded-lg w-12">
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
