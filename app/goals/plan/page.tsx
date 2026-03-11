"use client";

import { Save, Plus, Trash2, Calendar, BookOpen, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getKPITemplates } from '@/app/actions/kpi';
import { createGoals, deleteGoal, getGoals } from '@/app/actions/goal';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type DraftGoal = {
    id: number;
    templateId?: string;
    title: string;
    weight: number;
    target: string;
    metric: string;
    subsidiary: string;
    period: string;
    description: string;
    isCustom: boolean;
};

const subsidiaries = ["Rudra Architectural Studio (RAS)", "Gridwise", "Metrum Works", "Rite Hands"];
const quarters = ["Q1 FY26-27", "Q2 FY26-27", "Q3 FY26-27", "Q4 FY26-27", "FY26-27 Summary"];

function buildQuarterDates(period: string) {
    const mapping: Record<string, { start: string; end: string }> = {
        'Q1 FY26-27': { start: '2026-04-01', end: '2026-06-30' },
        'Q2 FY26-27': { start: '2026-07-01', end: '2026-09-30' },
        'Q3 FY26-27': { start: '2026-10-01', end: '2026-12-31' },
        'Q4 FY26-27': { start: '2027-01-01', end: '2027-03-31' },
        'FY26-27 Summary': { start: '2026-04-01', end: '2027-03-31' },
    };

    return mapping[period] || mapping['Q1 FY26-27'];
}

export default function QuarterlyPlanner() {
    const searchParams = useSearchParams();
    const [selectedQuarter, setSelectedQuarter] = useState(quarters[0]);
    const [selectedSubsidiary, setSelectedSubsidiary] = useState(subsidiaries[0]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [savedGoals, setSavedGoals] = useState<any[]>([]);
    const [goals, setGoals] = useState<DraftGoal[]>([]);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const load = async () => {
        const [templatesRes, goalsRes] = await Promise.all([getKPITemplates(), getGoals()]);
        if (templatesRes.success) setTemplates(templatesRes.data || []);
        if (goalsRes.success) setSavedGoals(goalsRes.data || []);
    };

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        const templateId = searchParams.get('template');
        if (!templateId || templates.length === 0) return;
        const template = templates.find((item) => item._id === templateId || item.id === templateId);
        if (!template) return;

        setGoals((current) => {
            const exists = current.some((goal) => goal.templateId === templateId);
            return exists ? current : [...current, {
                id: Date.now(),
                templateId,
                title: template.name,
                weight: 0,
                target: template.defaultTarget || '',
                metric: template.unit || 'Count',
                subsidiary: selectedSubsidiary,
                period: selectedQuarter,
                description: template.description || '',
                isCustom: false,
            }];
        });
    }, [searchParams, templates, selectedQuarter, selectedSubsidiary]);

    const addGoalFromTemplate = (template: any) => {
        setGoals((current) => [...current, {
            id: Date.now(),
            templateId: template._id || template.id,
            title: template.name,
            weight: 0,
            target: template.defaultTarget || '',
            metric: template.unit,
            subsidiary: selectedSubsidiary,
            period: selectedQuarter,
            description: template.description || '',
            isCustom: false,
        }]);
        toast.success(`Added ${template.name} to plan`);
        setIsLibraryOpen(false);
    };

    const addCustomGoal = () => {
        setGoals((current) => [...current, {
            id: Date.now(),
            title: '',
            weight: 0,
            target: '',
            metric: 'Count',
            subsidiary: selectedSubsidiary,
            period: selectedQuarter,
            description: '',
            isCustom: true,
        }]);
    };

    const updateDraftGoal = (id: number, field: keyof DraftGoal, value: string | number) => {
        setGoals((current) => current.map((goal) => goal.id === id ? { ...goal, [field]: value } : goal));
    };

    const removeDraftGoal = (id: number) => {
        setGoals((current) => current.filter((goal) => goal.id !== id));
    };

    const currentWeight = goals.reduce((acc, curr) => acc + Number(curr.weight || 0), 0);

    const filteredTemplates = templates.filter((template) =>
        (selectedCategory === "All" || template.department === selectedCategory) &&
        template.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const categories = ["All", ...Array.from(new Set(templates.map((template) => template.department)))];

    const filteredSavedGoals = useMemo(() => {
        return savedGoals.filter((goal) => {
            const matchPeriod = goal.fiscalPeriod === selectedQuarter;
            const matchSub = goal.subsidiary === selectedSubsidiary;
            return matchPeriod && matchSub;
        });
    }, [savedGoals, selectedQuarter, selectedSubsidiary]);

    const handleSavePlan = async () => {
        if (goals.length === 0) {
            toast.error("Please add at least one goal");
            return;
        }

        if (currentWeight !== 100) {
            toast.error("Weight distribution must total exactly 100%");
            return;
        }

        if (goals.some((goal) => !goal.title || !goal.target)) {
            toast.error("Each goal needs a title and target");
            return;
        }

        const formattedGoals: any[] = goals.map((goal) => {
            const { start, end } = buildQuarterDates(goal.period);
            return {
                title: goal.title,
                subsidiary: goal.subsidiary,
                fiscalPeriod: goal.period,
                targetValue: String(goal.target),
                currentValue: '0',
                metric: goal.metric,
                description: goal.description || `Planned Goal: ${goal.title}`,
                startDate: new Date(start),
                endDate: new Date(end),
                status: 'Not Started' as const,
                priority: 'Medium' as const,
                progress: 0,
                weight: goal.weight,
                templateId: goal.templateId,
                kpiTemplates: goal.templateId ? [goal.templateId] : [],
            };
        });

        const res = await createGoals(formattedGoals);
        if (res.success) {
            toast.success(`Plan saved successfully. Created ${res.count} goals.`);
            setGoals([]);
            await load();
        } else {
            toast.error("Failed to save plan: " + res.error);
        }
    };

    const handleDeleteSavedGoal = async (id: string) => {
        const res = await deleteGoal(id);
        if (res.success) {
            toast.success('Goal deleted');
            await load();
        } else {
            toast.error(res.error || 'Failed to delete goal');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Goal Planner</h2>
                    <p className="text-gray-500">Define strategic objectives with weighted KPI-backed plans.</p>
                </div>
                <Button className="gap-2" onClick={handleSavePlan}>
                    <Save className="w-4 h-4" />
                    Save Plan
                </Button>
            </div>

            <div className="glass-card p-6 rounded-xl space-y-6 border border-gray-100">
                <div className="grid md:grid-cols-3 gap-4 p-4 bg-background rounded-lg border border-gray-100">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Planning Period</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={selectedQuarter}
                                aria-label="Select Planning Period"
                                onChange={(e) => setSelectedQuarter(e.target.value)}
                                className="w-full pl-9 p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                {quarters.map((quarter) => <option key={quarter} value={quarter}>{quarter}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Default Subsidiary</label>
                        <select
                            value={selectedSubsidiary}
                            aria-label="Select Default Subsidiary"
                            onChange={(e) => setSelectedSubsidiary(e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                            {subsidiaries.map((subsidiary) => <option key={subsidiary} value={subsidiary}>{subsidiary}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Weightage Distribution</label>
                        <div className={`w-full p-2 border rounded-lg text-sm font-medium flex justify-between items-center ${currentWeight === 100 ? 'bg-white border-green-200 text-green-700' : 'bg-white border-orange-200 text-orange-700'}`}>
                            <span>Total: {currentWeight}%</span>
                            {currentWeight !== 100 && <span className="text-xs">Target: 100%</span>}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="font-semibold text-gray-900">Draft Objectives</h3>
                        <span className="text-xs text-gray-400">{goals.length} Goals Defined</span>
                    </div>

                    {goals.map((goal, index) => (
                        <div key={goal.id} className="relative group p-4 bg-white hover:bg-background/50 rounded-lg border border-gray-200 transition-all hover:shadow-sm">
                            <div className="absolute -left-3 top-4 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                {index + 1}
                            </div>
                            <div className="ml-4 grid md:grid-cols-12 gap-4">
                                <div className="md:col-span-3">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">
                                        Goal Title {goal.isCustom ? "(Custom)" : "(Template)"}
                                    </label>
                                    <input
                                        type="text"
                                        aria-label={`Goal Title ${index + 1}`}
                                        value={goal.title}
                                        readOnly={!goal.isCustom}
                                        onChange={(e) => updateDraftGoal(goal.id, 'title', e.target.value)}
                                        placeholder="e.g. Increase Market Share"
                                        className={`w-full p-2 border border-gray-200 rounded text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 ${!goal.isCustom ? 'bg-background text-gray-600' : 'bg-transparent focus:bg-white'}`}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Subsidiary</label>
                                    <select
                                        value={goal.subsidiary}
                                        aria-label={`Subsidiary for Goal ${index + 1}`}
                                        onChange={(e) => updateDraftGoal(goal.id, 'subsidiary', e.target.value)}
                                        className="w-full p-2 border border-gray-200 rounded bg-transparent focus:bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        {subsidiaries.map((sub) => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Period</label>
                                    <select
                                        value={goal.period}
                                        aria-label={`Period for Goal ${index + 1}`}
                                        onChange={(e) => updateDraftGoal(goal.id, 'period', e.target.value)}
                                        className="w-full p-2 border border-gray-200 rounded bg-transparent focus:bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        {quarters.map((quarter) => (
                                            <option key={quarter} value={quarter}>{quarter}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Target ({goal.metric})</label>
                                    <input
                                        type="text"
                                        aria-label={`Target Value for Goal ${index + 1}`}
                                        value={goal.target}
                                        onChange={(e) => updateDraftGoal(goal.id, 'target', e.target.value)}
                                        placeholder="Value"
                                        className="w-full p-2 border border-gray-200 rounded bg-transparent focus:bg-white text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Weight (%)</label>
                                    <input
                                        type="number"
                                        aria-label={`Weightage for Goal ${index + 1}`}
                                        value={goal.weight}
                                        onChange={(e) => updateDraftGoal(goal.id, 'weight', Number(e.target.value))}
                                        className="w-full p-2 border border-gray-200 rounded bg-transparent focus:bg-white text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="md:col-span-1 flex items-end justify-end pb-1">
                                    <button
                                        onClick={() => removeDraftGoal(goal.id)}
                                        className="text-gray-400 hover:text-red-500 p-2 hover:bg-white rounded transition-colors"
                                        title="Delete Goal"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="md:col-span-12">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Description</label>
                                    <textarea
                                        value={goal.description}
                                        onChange={(e) => updateDraftGoal(goal.id, 'description', e.target.value)}
                                        className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        rows={2}
                                        placeholder="Optional execution notes"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="grid grid-cols-2 gap-4">
                        <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
                            <DialogTrigger asChild>
                                <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-white/50 transition-all flex items-center justify-center gap-2 font-medium">
                                    <BookOpen className="w-4 h-4" />
                                    Select from Library
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                                <DialogHeader>
                                    <DialogTitle>KPI Library</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 flex-1 flex flex-col min-h-0">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                placeholder="Search KPIs..."
                                                className="w-full pl-9 p-2 border rounded-md"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <select
                                            className="p-2 border rounded-md"
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            aria-label="Filter by Category"
                                        >
                                            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                        {filteredTemplates.map((template) => (
                                            <div key={template._id} className="p-3 border rounded-lg hover:bg-background flex justify-between items-center group">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                                                    <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                                        <span className="bg-white px-2 py-0.5 rounded">{template.department}</span>
                                                        <span className="bg-white px-2 py-0.5 rounded">{template.unit}</span>
                                                        <span className="bg-white px-2 py-0.5 rounded">{template.frequency}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                                                </div>
                                                <Button size="sm" variant="outline" onClick={() => addGoalFromTemplate(template)}>
                                                    <Plus className="w-4 h-4 mr-1" /> Add
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <button
                            onClick={addCustomGoal}
                            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-background/50 transition-all flex items-center justify-center gap-2 font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Create Custom Goal
                        </button>
                    </div>
                </div>
            </div>

            <div className="glass-card p-6 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between border-b pb-2 mb-4">
                    <h3 className="font-semibold text-gray-900">Saved Goals</h3>
                    <span className="text-xs text-gray-400">{filteredSavedGoals.length} records</span>
                </div>
                <div className="space-y-3">
                    {filteredSavedGoals.map((goal) => (
                        <div key={goal._id} className="p-4 border border-gray-200 rounded-lg bg-white flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-medium text-gray-900">{goal.title}</p>
                                    <span className="text-[10px] px-2 py-1 rounded-full border border-gray-200 text-gray-500">{goal.metric}</span>
                                    <span className="text-[10px] px-2 py-1 rounded-full border border-gray-200 text-gray-500">{goal.weight || 0}% weight</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    Target {goal.targetValue} • Current {goal.currentValue || '0'} • Progress {goal.progress || 0}%
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteSavedGoal(goal._id)}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        </div>
                    ))}
                    {filteredSavedGoals.length === 0 && (
                        <div className="text-sm text-gray-500 text-center py-6 border border-dashed border-gray-200 rounded-lg">
                            No saved goals for the selected period and subsidiary yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
