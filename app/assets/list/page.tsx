"use client";

import { Search, Filter, Monitor, Armchair, Printer, UserPlus, Undo2 } from 'lucide-react';
import { getAssets } from '@/app/actions/asset';
import { getUsers } from '@/app/actions/hrm';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AddAssetModal } from '@/components/assets/AddAssetModal';
import { AssetActionModal } from '@/components/assets/AssetActionModal';
import { Button } from '@/components/ui/button';

export default function AssetListPage() {
    const [assets, setAssets] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionModal, setActionModal] = useState<{ isOpen: boolean, type: 'assign' | 'return', asset: any | null }>({
        isOpen: false,
        type: 'assign',
        asset: null
    });

    // Filtering state
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [categoryFilter, setCategoryFilter] = useState("All");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [assetsRes, usersRes] = await Promise.all([getAssets(), getUsers()]);

            if (assetsRes.success && assetsRes.data) {
                setAssets(assetsRes.data.assets);
            }
            if (usersRes.success && usersRes.data) {
                setUsers(usersRes.data);
            }
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleActionComplete = () => {
        setActionModal({ ...actionModal, isOpen: false });
        loadData(); // Reload to see changes
    };

    const getIcon = (cat: string) => {
        if (cat.includes("Laptop") || cat.includes("Desktop") || cat.includes("Monitor")) return <Monitor className="w-4 h-4" />;
        if (cat.includes("Furniture")) return <Armchair className="w-4 h-4" />;
        return <Printer className="w-4 h-4" />;
    };

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.serialNo?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All" || asset.status === statusFilter;
        // Basic category filter (can be expanded)
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Assets...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Asset List</h1>
                    <p className="text-gray-500">View and manage detailed asset registry.</p>
                </div>
                <AddAssetModal />
            </div>

            {/* Filters */}
            <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or serial no..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 focus:outline-none bg-white"
                        aria-label="Filter by Status"
                    >
                        <option value="All">All Status</option>
                        <option value="Available">Available</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Retired">Retired</option>
                    </select>
                </div>
            </div>

            <div className="glass-card rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-background/50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Asset Info</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Assigned To</th>
                                <th className="px-6 py-4">Value</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredAssets.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No assets found match your criteria.
                                    </td>
                                </tr>
                            )}
                            {filteredAssets.map((asset) => (
                                <tr key={asset.id} className="hover:bg-background/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-semibold text-gray-900">{asset.name}</p>
                                            <p className="text-xs text-gray-500">#{asset.serialNo || asset.id.substr(-6)}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            {getIcon(asset.category)}
                                            {asset.category}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {asset.assignedTo ? (
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{asset.assignedTo.name}</span>
                                                <span className="text-xs">{asset.assignedTo.email}</span>
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{asset.value}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${asset.status === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                                                asset.status === 'Available' ? 'bg-green-100 text-green-800' :
                                                    asset.status === 'Maintenance' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-white text-gray-800'}`}>
                                            {asset.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {asset.status === 'Available' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setActionModal({ isOpen: true, type: 'assign', asset })}
                                                    className="h-8 w-8 p-0"
                                                    title="Assign Asset"
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                </Button>
                                            )}
                                            {asset.status === 'Assigned' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setActionModal({ isOpen: true, type: 'return', asset })}
                                                    className="h-8 w-8 p-0 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                                                    title="Return Asset"
                                                >
                                                    <Undo2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AssetActionModal
                isOpen={actionModal.isOpen}
                onClose={handleActionComplete}
                type={actionModal.type}
                asset={actionModal.asset}
                users={users}
            />
        </div>
    );
}
