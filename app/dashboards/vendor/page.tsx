"use client";

import { PageWrapper, CardWrapper } from '@/components/ui/page-wrapper';
import { Truck, FileText, Package, DollarSign } from 'lucide-react';
import { getVendorStats } from '@/app/actions/purchase';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function VendorDashboard() {
    const [stats, setStats] = useState<any>({ activeContracts: 0, pendingOrders: 0, pendingValue: 0, performance: 0 });
    const [vendorName] = useState("TechFlow Solutions"); // Simulated logged-in vendor

    useEffect(() => {
        const loadStats = async () => {
            const res = await getVendorStats(vendorName);
            if (res.success && res.data) {
                setStats(res.data);
            } else {
                toast.error("Failed to load vendor stats");
            }
        };
        loadStats();
    }, [vendorName]);

    const statCards = [
        { label: "Active Contracts", value: stats.activeContracts || 0, icon: FileText, color: "bg-blue-100 text-blue-600" },
        { label: "Pending Orders", value: stats.pendingOrders || 0, icon: Package, color: "bg-amber-100 text-amber-600" },
        { label: "Pending Invoices", value: `₹ ${(stats.pendingValue / 100000).toFixed(1)}L`, icon: DollarSign, color: "bg-green-100 text-green-600" },
        { label: "Performance Score", value: `${stats.performance}%`, icon: Truck, color: "bg-purple-100 text-purple-600" },
    ];

    return (
        <PageWrapper>
            <div className="mb-6">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Vendor Portal</h1>
                <p className="text-gray-500 mt-1">Welcome, {vendorName}. Manage your supply chain.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4 mb-6">
                {statCards.map((stat, i) => (
                    <CardWrapper key={i} delay={i * 0.1} className="glass-card p-5 rounded-xl border border-white/50 bg-white/40">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                                <h3 className="text-xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                    </CardWrapper>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <CardWrapper delay={0.4} className="glass-card p-5 rounded-xl">
                    <h3 className="text-lg font-bold mb-4">Recent Purchase Orders</h3>
                    <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500 text-sm">
                        No recent orders to display.
                    </div>
                </CardWrapper>

                <CardWrapper delay={0.5} className="glass-card p-5 rounded-xl">
                    <h3 className="text-lg font-bold mb-4">Upcoming Deliveries</h3>
                    <div className="space-y-4">
                        <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500 text-sm">
                            No deliveries scheduled for today.
                        </div>
                    </div>
                </CardWrapper>
            </div>
        </PageWrapper>
    );
}
