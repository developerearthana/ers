"use client";

import { useState } from 'react';
import { Plus, Trash2, ArrowLeft, BarChart3 } from 'lucide-react';
import Link from 'next/link';

import { KPI_METRICS } from '@/lib/constants';

export default function KPIMetricsMaster() {
    const [metrics, setMetrics] = useState([
        { id: 1, name: KPI_METRICS[0], unit: 'Currency', target: 'Monthly' },
        { id: 2, name: KPI_METRICS[1], unit: 'Score (1-10)', target: 'Quarterly' },
        { id: 3, name: KPI_METRICS[2], unit: 'Units', target: 'Weekly' },
        { id: 4, name: KPI_METRICS[3], unit: 'Hours', target: 'Daily' },
    ]);

    const [newMetric, setNewMetric] = useState('');
    const [newUnit, setNewUnit] = useState('');
    const [newTarget, setNewTarget] = useState('Monthly');

    const addMetric = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMetric || !newUnit) return;

        setMetrics([...metrics, {
            id: Date.now(),
            name: newMetric,
            unit: newUnit,
            target: newTarget
        }]);
        setNewMetric('');
        setNewUnit('');
    };

    const deleteMetric = (id: number) => {
        setMetrics(metrics.filter(m => m.id !== id));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/masters" className="p-2 hover:bg-white rounded-full transition-colors text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">KPI Metrics Configuration</h1>
                    <p className="text-gray-500">Define standard metrics for performance tracking across the organization.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    <div className="glass-card rounded-xl overflow-hidden border border-gray-100">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-background/50 border-b border-gray-100 text-gray-500">
                                <tr>
                                    <th className="p-4 font-medium">Metric Name</th>
                                    <th className="p-4 font-medium">Unit</th>
                                    <th className="p-4 font-medium">Freq.</th>
                                    <th className="p-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {metrics.map((metric) => (
                                    <tr key={metric.id} className="hover:bg-background/50 group">
                                        <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                                            <BarChart3 className="w-4 h-4 text-gray-400" />
                                            {metric.name}
                                        </td>
                                        <td className="p-4 text-gray-600">{metric.unit}</td>
                                        <td className="p-4 text-gray-600">{metric.target}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => deleteMetric(metric.id)}
                                                className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                aria-label={`Delete ${metric.name}`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {metrics.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-400">
                                            No metrics defined yet. Add one to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    <div className="glass-card p-6 rounded-xl space-y-4 sticky top-6">
                        <h3 className="font-semibold text-gray-900 border-b pb-2">Add New Metric</h3>
                        <form onSubmit={addMetric} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Metric Name</label>
                                <input
                                    type="text"
                                    value={newMetric}
                                    onChange={(e) => setNewMetric(e.target.value)}
                                    placeholder="e.g. Churn Rate"
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Unit of Measure</label>
                                <input
                                    type="text"
                                    value={newUnit}
                                    onChange={(e) => setNewUnit(e.target.value)}
                                    placeholder="e.g. Percentage"
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Default Frequency</label>
                                <select
                                    value={newTarget}
                                    aria-label="Default Frequency"
                                    onChange={(e) => setNewTarget(e.target.value)}
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                >
                                    <option>Daily</option>
                                    <option>Weekly</option>
                                    <option>Monthly</option>
                                    <option>Quarterly</option>
                                    <option>Yearly</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2 bg-white text-white rounded-lg text-sm font-medium hover:bg-white transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Metric
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
