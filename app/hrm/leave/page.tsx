"use client";

import { useState, useEffect } from 'react';
import { PageWrapper, CardWrapper } from '@/components/ui/page-wrapper';
import { LeaveCalendar } from '@/components/hrm/LeaveCalendar';
import { Progress } from '@/components/ui/progress';
import { Search, Filter, Check, X, AlertCircle, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { getLeaves, requestLeave, approveLeave, getAbsentees } from '@/app/actions/hrm';
import { toast } from 'sonner';

interface LeaveRequest {
    _id: string; // Changed from id: number
    userId: string;
    userName: string;
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    days?: number; // Calculated on frontend
    approverId?: string;
    approverName?: string;
    approverRole?: string;
}

import { useSession } from 'next-auth/react';

export default function LeaveManagementPage() {
    const { data: session } = useSession();
    const userRole = session?.user?.role?.toLowerCase() || '';
    const isAdminOrHR = userRole.includes('admin') || userRole.includes('manager') || userRole.includes('hr');
    // Staff default to "requests" so they immediately see their own leaves + statuses
    const [activeTab, setActiveTab] = useState<'requests' | 'calendar' | 'absentees'>(isAdminOrHR ? 'calendar' : 'requests');

    const [showForm, setShowForm] = useState(false);
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [absentees, setAbsentees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [newLeave, setNewLeave] = useState({
        type: 'Sick',
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadLeaves();
    }, []);

    const loadLeaves = async () => {
        try {
            const [leavesRes, absenteesRes] = await Promise.all([
                getLeaves(),
                getAbsentees()
            ]);

            if (leavesRes.success && leavesRes.data) {
                setRequests(leavesRes.data);
            }
            if (absenteesRes.success && absenteesRes.data) {
                setAbsentees(absenteesRes.data);
            }
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLeave = async () => {
        if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
            toast.error("Please fill all fields");
            return;
        }

        if (!session?.user?.id) {
            toast.error("You must be logged in");
            return;
        }

        setSubmitting(true);
        try {
            const res = await requestLeave({
                userId: session.user.id,
                userName: session.user.name || "Unknown User",
                type: newLeave.type as any,
                startDate: newLeave.startDate,
                endDate: newLeave.endDate,
                reason: newLeave.reason
            });


            if (res.success) {
                toast.success("Leave requested successfully");
                setShowForm(false);
                setNewLeave({ type: 'Sick', startDate: '', endDate: '', reason: '' });
                loadLeaves();
            } else {
                toast.error(res.error || "Failed to submit request");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAction = async (id: string, action: 'Approved' | 'Rejected') => {
        try {
            const res = await approveLeave(id, action);
            if (res.success) {
                toast.success(`Request ${action}`);
                loadLeaves();
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    // Helper to calculate days
    const getDays = (start: string, end: string) => {
        const s = new Date(start);
        const e = new Date(end);
        return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    };

    const pendingRequests = requests.filter(r => r.status === 'Pending');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <PageWrapper className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Leave Management</h1>
                    <p className="text-muted-foreground">Manage leave requests, balance, and calendar.</p>
                </div>
                <div className="flex gap-2 bg-white p-1 rounded-lg">
                    {['calendar', 'requests', 'absentees'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${activeTab === tab
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Split View for Calendar Mode */}
            {activeTab === 'calendar' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                    <div className="lg:col-span-2 h-full">
                        <LeaveCalendar {...({
                            events: requests.filter(r => r.status === 'Approved').map(r => ({
                                title: `${r.userName} (${r.type})`,
                                start: new Date(r.startDate),
                                end: new Date(r.endDate),
                                allDay: true
                            }))
                        } as any)} />
                    </div>
                    <div className="space-y-6 flex flex-col h-full">
                        {/* Balance Card - Static for Demo, Dynamic if User Model had Leave Balance */}
                        <CardWrapper delay={0.1} className="glass-card p-6 rounded-xl border border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-4">Leave Balance</h4>
                            <div className="space-y-4">
                                {[
                                    { type: "Casual Leave", used: 2, total: 12, color: "bg-white0" },
                                    { type: "Sick Leave", used: 1, total: 7, color: "bg-red-500" },
                                    { type: "Privilege Leave", used: 0, total: 15, color: "bg-white0" },
                                ].map(bal => (
                                    <div key={bal.type}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">{bal.type}</span>
                                            <span className="font-bold text-gray-900">{bal.total - bal.used} left</span>
                                        </div>
                                        <Progress
                                            value={(bal.used / bal.total) * 100}
                                            className="h-2"
                                            indicatorClassName={bal.color}
                                        />
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setShowForm(true)} className="w-full mt-6 bg-primary text-white py-2 rounded-lg text-sm font-semibold shadow-lg hover:bg-primary/90 transition-all">
                                + Apply Leave
                            </button>
                        </CardWrapper>

                        {/* Approvals Widget */}
                        {isAdminOrHR && (
                            <CardWrapper delay={0.2} className="glass-card p-6 rounded-xl border border-gray-100 flex-1 overflow-auto">
                                <h4 className="font-bold text-gray-900 mb-4">Pending Approvals</h4>
                                <div className="space-y-3">
                                    {pendingRequests.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-4">No pending requests</p>
                                    ) : (
                                        pendingRequests.map(req => (
                                            <div key={req._id} className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-sm font-bold text-gray-900">{req.userName}</span>
                                                    <span className="text-xs bg-white px-2 py-0.5 rounded text-gray-600">{req.type}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-3">{format(new Date(req.startDate), 'dd MMM')} - {format(new Date(req.endDate), 'dd MMM')}</p>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleAction(req._id, 'Approved')} className="flex-1 py-1 bg-emerald-50 text-green-700 text-xs font-bold rounded hover:bg-green-100">Approve</button>
                                                    <button onClick={() => handleAction(req._id, 'Rejected')} className="flex-1 py-1 bg-red-50 text-red-700 text-xs font-bold rounded hover:bg-red-100">Reject</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardWrapper>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'requests' && (
                <CardWrapper className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input aria-label="Search requests" type="text" placeholder="Search requests..." className="pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border rounded-lg hover:bg-background">
                                <Filter className="w-4 h-4" /> Filter
                            </button>
                        </div>
                        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 text-sm font-semibold transition-colors">
                            <Plus className="w-4 h-4" /> New Request
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {requests.length === 0 ? <p className="text-center text-gray-500 py-10">No requests found</p> : requests.map(req => (
                            <div key={req._id} className="glass-card p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between group gap-4 md:gap-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold">
                                        {req.userName.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{req.userName}</h4>
                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                            <span className="bg-white px-2 py-0.5 rounded text-xs">{req.type}</span>
                                            <span>{getDays(req.startDate, req.endDate)} days ({format(new Date(req.startDate), 'dd MMM')} to {format(new Date(req.endDate), 'dd MMM')})</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 justify-between md:justify-end w-full md:w-auto">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600 max-w-xs truncate" title={req.reason}>{req.reason}</p>
                                    </div>

                                    {req.status === 'Pending' ? (
                                        isAdminOrHR ? (
                                            <div className="flex gap-2">
                                                <button aria-label="Approve Request" onClick={() => handleAction(req._id, 'Approved')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors" title="Approve">
                                                    <Check className="w-4 h-4" /> Accept
                                                </button>
                                                <button aria-label="Reject Request" onClick={() => handleAction(req._id, 'Rejected')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg transition-colors" title="Reject">
                                                    <X className="w-4 h-4" /> Decline
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="px-3 py-1.5 rounded-full text-xs font-bold border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
                                                Awaiting Approval
                                            </span>
                                        )
                                    ) : req.status === 'Approved' ? (
                                        <span className="px-3 py-1.5 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1.5 shadow-sm">
                                            <Check className="w-3.5 h-3.5" /> Approved
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1.5 rounded-full text-xs font-bold border bg-red-50 text-red-700 border-red-200 flex items-center gap-1.5 shadow-sm">
                                            <X className="w-3.5 h-3.5" /> Declined
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardWrapper>
            )}

            {activeTab === 'absentees' && (
                <CardWrapper className="glass-card rounded-xl overflow-hidden">
                    <div className="p-4 bg-white border-b border-border flex items-center gap-2 text-orange-800">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-semibold">Absentees Today ({format(new Date(), 'dd MMM yyyy')})</span>
                    </div>
                    {absentees.length === 0 ? (
                        <div className="p-10 text-center text-gray-500 bg-white">
                            <Check className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                            <p className="font-medium text-gray-900">Everyone is present today!</p>
                            <p className="text-sm mt-1">No absentees recorded.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 bg-white">
                            {absentees.map((absentee, index) => (
                                <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center">
                                            {absentee.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{absentee.name}</p>
                                            <p className="text-sm text-gray-500">{absentee.dept} • {absentee.role}</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium border border-red-100">
                                        Absent
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardWrapper>
            )}

            {/* Leave Request Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-4">Request Leave</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                                <select
                                    id="leaveType"
                                    className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                                    value={newLeave.type}
                                    onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })}
                                >
                                    <option>Sick</option>
                                    <option>Casual</option>
                                    <option>Festival</option>
                                    <option>Emergency</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        id="startDate"
                                        type="date"
                                        className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                                        value={newLeave.startDate}
                                        onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        id="endDate"
                                        type="date"
                                        className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                                        value={newLeave.endDate}
                                        onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                <textarea
                                    id="reason"
                                    className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                                    rows={3}
                                    placeholder="Please provide a reason..."
                                    value={newLeave.reason}
                                    onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-background rounded-lg">Cancel</button>
                                <button
                                    onClick={handleCreateLeave}
                                    disabled={submitting}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Submit Request
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PageWrapper>
    );
}
