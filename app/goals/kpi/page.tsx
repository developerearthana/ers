"use client";

import { AlertCircle, CheckCircle, TrendingUp, Filter, Plus, X, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { KPIEntryModal } from '@/components/goals/KPIEntryModal';
import { KPI_METRICS } from '@/lib/constants';
import { DEPARTMENTS, MOCK_KPI_TARGETS } from '@/lib/mock-data';
import { getUsers } from '@/app/actions/hrm';
import { getKPIEntries, createKPIEntry } from '@/app/actions/kpi';
import { getGoals } from '@/app/actions/goal';
import { toast } from 'sonner';
import { User } from '@/types';

// Mock targets for now until Target module is built
const KPITargets = MOCK_KPI_TARGETS;

export default function WeeklyKPI() {
    const [selectedSubsidiary, setSelectedSubsidiary] = useState("All");
    const [selectedTeam, setSelectedTeam] = useState("All");
    const [showModal, setShowModal] = useState(false);
    const [entries, setEntries] = useState<any[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const subsidiaries = ["All", "Rudra Architectural Studio (RAS)", "Gridwise", "Metrum Works", "Rite Hands"];

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, entriesRes] = await Promise.all([
                    getUsers(),
                    getKPIEntries()
                ]);

                if (usersRes?.success && usersRes.data) {
                    setUsers(usersRes.data);
                }

                if (entriesRes?.success && entriesRes.data) {
                    setEntries(entriesRes.data);
                }

                const goalsRes = await getGoals();
                if (goalsRes?.success) {
                    setGoals(goalsRes.data);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
                toast.error("Failed to load KPI data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAddEntry = async (entry: any) => {
        try {
            const result = await createKPIEntry(entry);

            if (result.success) {
                toast.success("KPI Entry Added");
                setShowModal(false);
                // Refresh data
                const entriesRes = await getKPIEntries();
                if (entriesRes?.success && entriesRes.data) {
                    setEntries(entriesRes.data);
                }
            } else {
                toast.error(result.error || "Failed to add entry");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        }
    };

    const filteredEntries = entries.filter(e => {
        const matchSub = selectedSubsidiary === "All" || e.subsidiary === selectedSubsidiary;
        const matchTeam = selectedTeam === "All" || e.team === selectedTeam;
        return matchSub && matchTeam;
    });

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading KPI Data...</div>;
    }

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Weekly KPI Tracker</h2>
                    <p className="text-gray-500">Monitor weekly performance against key metrics.</p>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="relative">
                        <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <select
                            aria-label="Filter by Subsidiary"
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedSubsidiary}
                            onChange={(e) => setSelectedSubsidiary(e.target.value)}
                        >
                            {subsidiaries.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative">
                        <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <select
                            aria-label="Filter by Team"
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedTeam}
                            onChange={(e) => setSelectedTeam(e.target.value)}
                        >
                            <option value="All">All Teams</option>
                            {DEPARTMENTS.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    <select aria-label="Select Date Range" className="p-2 border border-gray-200 rounded-lg text-sm">
                        <option>Q4 FY25-26</option>
                        <option>Q1 FY26-27</option>
                    </select>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Entry
                    </button>
                </div>
            </div>

            <div className="glass-card rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-background/50 border-b border-gray-100 text-gray-500">
                            <th className="p-4 font-medium">Week</th>
                            <th className="p-4 font-medium">Metric</th>
                            <th className="p-4 font-medium">Assignee / Team</th>
                            <th className="p-4 font-medium text-right">Target</th>
                            <th className="p-4 font-medium text-right">Actual</th>
                            <th className="p-4 font-medium text-right">Variance</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Comments</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredEntries.map((entry) => (
                            <tr key={entry.id} className="hover:bg-background/50">
                                <td className="p-4 font-medium text-gray-900">
                                    {entry.week}
                                    <div className="text-xs text-gray-500 font-normal">{entry.subsidiary.split(" ")[0]}..</div>
                                </td>
                                <td className="p-4 text-gray-600 font-medium">{entry.metric}</td>
                                <td className="p-4">
                                    <div className="font-medium text-gray-900">{entry.assigneeName || entry.assignee}</div>
                                    <div className="text-xs text-gray-500">{entry.team}</div>
                                </td>
                                <td className="p-4 text-right text-gray-600 font-medium">{entry.target}</td>
                                <td className="p-4 text-right text-gray-900 font-bold">{entry.actual}</td>
                                <td className={`p-4 text-right font-medium ${entry.variance?.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                    {entry.variance}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        {entry.status === 'Exceeded' && <TrendingUp className="w-4 h-4 text-green-500" />}
                                        {entry.status === 'Met' && <CheckCircle className="w-4 h-4 text-blue-500" />}
                                        {entry.status === 'Missed' && <AlertCircle className="w-4 h-4 text-red-500" />}
                                        <span className={`text-xs px-2 py-0.5 rounded-full border
                                            ${entry.status === 'Exceeded' ? 'bg-white border-green-200 text-green-700' :
                                                entry.status === 'Met' ? 'bg-white border-blue-200 text-blue-700' :
                                                    'bg-red-50 border-red-200 text-red-700'}`}>
                                            {entry.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-500 italic max-w-xs truncate" title={entry.comment}>
                                    "{entry.comment}"
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Entry Modal */}
            <KPIEntryModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleAddEntry}
                subsidiaries={subsidiaries}
                metrics={KPI_METRICS}
                users={users}
                targets={KPITargets}
                goals={goals}
            />
        </div>
    );
}
