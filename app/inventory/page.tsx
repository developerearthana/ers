"use client";

import { Package, AlertTriangle, ArrowUpRight, TrendingUp, Archive, AlertCircle, Tags } from 'lucide-react';
import { PageWrapper, CardWrapper } from '@/components/ui/page-wrapper';
import { WarehouseLayout } from '@/components/inventory/WarehouseLayout';
import { useState, useEffect } from 'react';
import { getInventoryDashboard } from '@/app/actions/inventory';
import { toast } from 'sonner';

export default function InventoryDashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStockCount: 0,
        outOfStock: 0,
        totalValue: 0
    });
    const [lowStockItems, setLowStockItems] = useState<any[]>([]);
    const [distribution, setDistribution] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await getInventoryDashboard();
            if (res.success && res.data) {
                setStats(res.data.stats);
                setLowStockItems(res.data.lowStockItems);
                setDistribution(res.data.distribution);
            }
        } catch (error) {
            toast.error("Failed to load inventory data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Inventory...</div>;

    return (
        <PageWrapper className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Inventory Overview</h1>
                <p className="text-gray-500">Manage stock levels, digital warehouse tracking, and supply chain.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Products", value: stats.totalProducts.toLocaleString(), trend: "Items", isUp: true, icon: Package, color: "bg-white", textColor: "text-blue-600", border: "border-border" },
                    { label: "Low Stock Items", value: stats.lowStockCount.toLocaleString(), trend: "Needs Attention", isUp: false, icon: AlertTriangle, color: "bg-white", textColor: "text-orange-600", border: "border-border" },
                    { label: "Out of Stock", value: stats.outOfStock.toLocaleString(), trend: "Critical", isUp: false, icon: AlertCircle, color: "bg-red-50", textColor: "text-red-600", border: "border-red-100" },
                    { label: "Total Value", value: `₹${(stats.totalValue / 100000).toFixed(2)} L`, trend: "Est. Value", isUp: true, icon: TrendingUp, color: "bg-white", textColor: "text-green-600", border: "border-border" },
                ].map((stat, i) => (
                    <CardWrapper key={stat.label} delay={i * 0.1} className={`glass-card p-5 rounded-xl border ${stat.border} flex flex-col justify-between h-32`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-2 rounded-lg ${stat.color}`}>
                                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                            </div>
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-medium ${stat.isUp ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.isUp ? <ArrowUpRight className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                            {stat.trend}
                        </div>
                    </CardWrapper>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Visual Warehouse Layout */}
                <div className="lg:col-span-3">
                    <CardWrapper delay={0.4}>
                        <WarehouseLayout />
                    </CardWrapper>
                </div>

                {/* Low Stock Alerts */}
                <CardWrapper delay={0.5} className="lg:col-span-2 glass-card p-6 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Low Stock Alerts</h3>
                        <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 text-sm text-gray-500">
                                    <th className="pb-3 font-medium">Product Name</th>
                                    <th className="pb-3 font-medium">SKU</th>
                                    <th className="pb-3 font-medium">Category</th>
                                    <th className="pb-3 font-medium text-right">Available</th>
                                    <th className="pb-3 font-medium text-right">Min Level</th>
                                    <th className="pb-3 font-medium text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {lowStockItems.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-4 text-center text-gray-500">No low stock items</td>
                                    </tr>
                                )}
                                {lowStockItems.map((item) => (
                                    <tr key={item.id} className="group hover:bg-background transition-colors">
                                        <td className="py-4 font-medium text-gray-900">{item.name}</td>
                                        <td className="py-4 text-gray-500">{item.sku}</td>
                                        <td className="py-4 text-gray-500">{item.category}</td>
                                        <td className="py-4 text-right font-medium text-red-600">{item.current}</td>
                                        <td className="py-4 text-right text-gray-500">{item.min}</td>
                                        <td className="py-4 text-right">
                                            <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                                                Low
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardWrapper>

                {/* Distribution Summary */}
                <CardWrapper delay={0.6} className="glass-card p-6 rounded-xl border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Distribution</h3>
                    <div className="space-y-4">
                        {distribution.map((dist, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-background/50">
                                <div className="flex items-center gap-3">
                                    <Package className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-medium text-gray-700">{dist._id}</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">{dist.count}</span>
                            </div>
                        ))}
                        {distribution.length === 0 && <p className="text-sm text-gray-500 text-center">No products found</p>}
                    </div>
                    <button className="w-full mt-6 bg-white text-white py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors shadow-lg shadow-gray-200">
                        Add New Product
                    </button>
                </CardWrapper>
            </div>
        </PageWrapper>
    );
}
