"use client";

import { Monitor, Server, Wrench, AlertTriangle, TrendingUp, Download, Printer, ArrowUpRight, UserPlus } from 'lucide-react';
import { getAssets } from '@/app/actions/asset';
import { getUsers } from '@/app/actions/hrm';
import { useEffect, useState } from 'react';
import AssetDistributionChart from '@/components/assets/AssetDistributionChart';
import { exportToCSV, handlePrint } from '@/lib/export-utils';
import { toast } from 'sonner';
import { AssetActionModal } from '@/components/assets/AssetActionModal';

export default function AssetsDashboard() {
    const [stats, setStats] = useState<any>({ total: 0, assigned: 0, maintenance: 0, value: 0 });
    const [assets, setAssets] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [assetsRes, usersRes] = await Promise.all([getAssets(), getUsers()]);

            if (assetsRes.success && assetsRes.data) {
                setStats(assetsRes.data.stats);
                setAssets(assetsRes.data.assets);
            }
            if (usersRes.success && usersRes.data) {
                setUsers(usersRes.data);
            }
        } catch (error) {
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    // Process data for Chart
    const categoryData = assets.reduce((acc: any, asset: any) => {
        const cat = asset.category || 'Other';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.keys(categoryData).map((key, index) => ({
        name: key,
        value: categoryData[key],
        color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
    }));

    const availableAssets = assets.filter(a => a.status === 'Available');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assets Overview</h1>
                    <p className="text-gray-500">Track company assets, value, and health.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsAssignModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        Quick Assign
                    </button>
                    <button
                        onClick={() => exportToCSV(assets, 'assets-list')}
                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-background text-sm font-medium"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-background text-sm font-medium"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Assets", value: stats.total, sub: "Items", icon: Monitor, color: "bg-white", textColor: "text-blue-600", border: "border-border" },
                    { label: "Total Value", value: `₹${(stats.value || 0).toLocaleString('en-IN')}`, sub: "Current Worth", icon: TrendingUp, color: "bg-white", textColor: "text-green-600", border: "border-border" },
                    { label: "Assigned", value: stats.assigned, sub: "In Use", icon: Server, color: "bg-white", textColor: "text-purple-600", border: "border-border" },
                    { label: "In Maintenance", value: stats.maintenance, sub: "Unavailable", icon: Wrench, color: "bg-white", textColor: "text-orange-600", border: "border-border" },
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
                            <span className="flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3 text-gray-400" /> {stat.sub}
                            </span>
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Asset Distribution Chart */}
                <div className="lg:col-span-1 glass-card p-5 rounded-xl border border-gray-100 h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Category Distribution</h3>
                    <div className="flex-1 min-h-0">
                        <AssetDistributionChart data={chartData} />
                    </div>
                </div>

                {/* Recent Activity / Assets Table */}
                <div className="lg:col-span-2 glass-card rounded-xl overflow-hidden border border-gray-100 flex flex-col h-[400px]">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-background/50">
                        <h3 className="text-lg font-bold text-gray-900">Recent Assets</h3>
                        <button className="text-xs text-blue-600 font-medium hover:text-blue-700">View All</button>
                    </div>
                    <div className="overflow-auto flex-1">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-background text-gray-500 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Asset Name</th>
                                    <th className="px-4 py-3 font-medium">Category</th>
                                    <th className="px-4 py-3 font-medium">Serial No</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {assets.slice(0, 5).map((asset) => (
                                    <tr key={asset.id} className="hover:bg-background/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900">{asset.name}</td>
                                        <td className="px-4 py-3 text-gray-500">{asset.category}</td>
                                        <td className="px-4 py-3 text-gray-500">{asset.serialNo || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded
                                                ${asset.status === 'Available' ? 'bg-white text-green-600' :
                                                    asset.status === 'Assigned' ? 'bg-white text-blue-600' :
                                                        'bg-white text-gray-600'}`}>
                                                {asset.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {assets.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-10 text-gray-500">No assets found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <AssetActionModal
                isOpen={isAssignModalOpen}
                onClose={() => {
                    setIsAssignModalOpen(false);
                    loadData();
                }}
                type="assign"
                asset={null}
                users={users}
                availableAssets={availableAssets}
            />
        </div>
    );
}
