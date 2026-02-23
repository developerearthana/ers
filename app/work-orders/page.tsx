"use client";

import { ClipboardList, AlertCircle, CheckSquare, RotateCw, Plus, Filter, MoreVertical, Download, Printer } from 'lucide-react';
import { useState, useEffect } from 'react';
import { WorkOrderCreateModal } from '@/components/work-orders/WorkOrderCreateModal';
import { MOCK_SUBSIDIARIES, MOCK_VENDORS } from '@/lib/mock-data';
import { exportToCSV, handlePrint } from '@/lib/export-utils';
import { getWorkOrders, createWorkOrder } from '@/app/actions/work-orders';
import { getProjects } from '@/app/actions/projects';
import { toast } from 'sonner';

export default function WorkOrdersDashboard() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const stats = [
        { label: "Open Work Orders", value: orders.filter(o => o.status === 'Open').length.toString(), sub: "Total Open", icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-100" },
        { label: "In Progress", value: orders.filter(o => o.status === 'In Progress').length.toString(), sub: "Assigned", icon: RotateCw, color: "text-orange-600", bg: "bg-orange-100" },
        { label: "Completed", value: orders.filter(o => o.status === 'Completed').length.toString(), sub: "All Time", icon: CheckSquare, color: "text-green-600", bg: "bg-green-100" },
        { label: "High Priority", value: orders.filter(o => o.priority === 'High' || o.priority === 'Critical').length.toString(), sub: "Attention Needed", icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [ordersRes, projectsRes] = await Promise.all([
                getWorkOrders(),
                getProjects()
            ]);

            if (ordersRes.success && ordersRes.data) {
                setOrders(ordersRes.data);
            }
            if (projectsRes.success && projectsRes.data) {
                setProjects(projectsRes.data);
            }
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data: any) => {
        try {
            const res = await createWorkOrder(data);
            if (res.success) {
                toast.success("Work Order Created");
                setShowCreateModal(false);
                loadData();
            } else {
                toast.error(res.error || "Failed decrease to create work order");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Work Orders...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
                    <p className="text-gray-500">Track maintenance, internal work, and vendor contracts.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => exportToCSV(orders, 'work-orders')}
                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-background text-sm"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-background text-sm"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                    <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-background transition-colors text-sm">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors shadow-sm text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Create Order
                    </button>
                </div>
            </div>

            {/* Stats - Smaller Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Open Work Orders", value: stats[0].value, sub: stats[0].sub, icon: ClipboardList, color: "bg-white", textColor: "text-blue-600", border: "border-border" },
                    { label: "In Progress", value: stats[1].value, sub: stats[1].sub, icon: RotateCw, color: "bg-white", textColor: "text-orange-600", border: "border-border" },
                    { label: "Completed", value: stats[2].value, sub: stats[2].sub, icon: CheckSquare, color: "bg-white", textColor: "text-green-600", border: "border-border" },
                    { label: "High Priority", value: stats[3].value, sub: stats[3].sub, icon: AlertCircle, color: "bg-red-50", textColor: "text-red-600", border: "border-red-100" },
                ].map((stat, idx) => (
                    <div key={idx} className={`glass-card p-5 rounded-xl border ${stat.border} flex flex-col justify-between h-32`}>
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
                            {stat.textColor === "text-red-600" ?
                                <AlertCircle className="w-3 h-3 text-red-500" /> :
                                <CheckSquare className="w-3 h-3 text-gray-400" />
                            }
                            {stat.sub}
                        </p>
                    </div>
                ))}
            </div>

            {/* List */}
            <div className="glass-card rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-background/50 text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-medium">WO ID & Title</th>
                                <th className="px-6 py-4 font-medium">Type & Project</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Assignee</th>
                                <th className="px-6 py-4 font-medium">Cost (Est.)</th>
                                <th className="px-6 py-4 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No work orders found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                            {orders.map((wo) => (
                                <tr key={wo.id} className="hover:bg-background/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-semibold text-gray-900">{wo.title}</div>
                                            <div className="text-xs text-blue-600 font-medium">{wo.id} • {wo.date}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mb-1
                                                ${wo.type === 'Vendor' ? 'bg-white text-orange-700 border border-border' :
                                                    'bg-white text-blue-700 border border-border'}`}>
                                                {wo.type === 'Vendor' ? 'Vendor Contract' : 'Internal Work'}
                                            </span>
                                            <div className="text-xs text-gray-500">{wo.project}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-medium
                                            ${wo.status === 'Completed' ? 'text-green-600' :
                                                wo.status === 'In Progress' ? 'text-blue-600' :
                                                    'text-gray-500'}`}>
                                            {wo.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] text-gray-500 font-bold">
                                                {wo.assignee?.charAt(0) || '?'}
                                            </div>
                                            <span className="text-gray-700">{wo.assignee}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 font-medium">
                                        ₹{wo.cost?.toLocaleString() || 0}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button aria-label="Work Order Actions" className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-white rounded-lg transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <WorkOrderCreateModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreate}
                projects={projects}
                subsidiaries={MOCK_SUBSIDIARIES}
                vendors={MOCK_VENDORS}
            />
        </div>
    );
}
