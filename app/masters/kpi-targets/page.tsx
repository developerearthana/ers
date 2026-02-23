"use client";

import { useState } from 'react';
import { Plus, Trash2, ArrowLeft, Target, User, BarChart3 } from 'lucide-react';
import Link from 'next/link';

import { KPI_METRICS } from '@/lib/constants';
import { MOCK_USERS, MOCK_KPI_TARGETS } from '@/lib/mock-data';

export default function KPITargetsMaster() {
    // In a real app, this would be fetched from an API
    const [targets, setTargets] = useState(MOCK_KPI_TARGETS);

    const [newUser, setNewUser] = useState('');
    const [newMetric, setNewMetric] = useState(KPI_METRICS[0]);
    const [newTargetValue, setNewTargetValue] = useState('');
    const [newPeriod, setNewPeriod] = useState('Monthly');

    const addTarget = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser || !newMetric || !newTargetValue) return;

        // Check for duplicates
        if (targets.some(t => t.user === newUser && t.metric === newMetric)) {
            alert("Target for this User and Metric already exists!");
            return;
        }

        setTargets([...targets, {
            id: Date.now(),
            user: newUser,
            metric: newMetric,
            target: newTargetValue,
            period: newPeriod
        }]);
        setNewTargetValue('');
    };

    const deleteTarget = (id: number) => {
        setTargets(targets.filter(t => t.id !== id));
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/masters" className="p-2 hover:bg-white rounded-full transition-colors text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage KPI Targets</h1>
                    <p className="text-gray-500">Assign specific performance targets to users for automated tracking.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* List Section */}
                <div className="md:col-span-2 space-y-4">
                    <div className="glass-card rounded-xl overflow-hidden border border-gray-100">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-background/50 border-b border-gray-100 text-gray-500">
                                <tr>
                                    <th className="p-4 font-medium">User</th>
                                    <th className="p-4 font-medium">Metric</th>
                                    <th className="p-4 font-medium">Target</th>
                                    <th className="p-4 font-medium">Period</th>
                                    <th className="p-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {targets.map((target) => (
                                    <tr key={target.id} className="hover:bg-background/50 group">
                                        <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                                            <User className="w-4 h-4 text-blue-500" />
                                            {target.user}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <BarChart3 className="w-3 h-3 text-gray-400" />
                                                {target.metric}
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-gray-900">{target.target}</td>
                                        <td className="p-4 text-gray-500 text-xs uppercase tracking-wide">{target.period}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => deleteTarget(target.id)}
                                                className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                aria-label={`Delete target for ${target.user}`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {targets.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-400">
                                            No targets assigned yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Form Section */}
                <div>
                    <div className="glass-card p-6 rounded-xl space-y-4 sticky top-6">
                        <div className="flex items-center gap-2 border-b pb-2">
                            <Target className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">Assign New Target</h3>
                        </div>
                        <form onSubmit={addTarget} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">User</label>
                                <select
                                    value={newUser}
                                    onChange={(e) => setNewUser(e.target.value)}
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    required
                                    aria-label="Select User"
                                >
                                    <option value="">Select User</option>
                                    {MOCK_USERS.filter(u => u.status === 'Active').map(u => (
                                        <option key={u.id} value={u.name}>{u.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Metric</label>
                                <select
                                    value={newMetric}
                                    onChange={(e) => setNewMetric(e.target.value)}
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    required
                                    aria-label="Select Metric"
                                >
                                    {KPI_METRICS.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Target Value</label>
                                    <input
                                        type="text"
                                        value={newTargetValue}
                                        onChange={(e) => setNewTargetValue(e.target.value)}
                                        placeholder="Value"
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Period</label>
                                    <select
                                        value={newPeriod}
                                        onChange={(e) => setNewPeriod(e.target.value)}
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        aria-label="Select Period"
                                    >
                                        <option>Daily</option>
                                        <option>Weekly</option>
                                        <option>Monthly</option>
                                        <option>Quarterly</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Assign Target
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
