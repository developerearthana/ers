"use client";

import { useState, useEffect } from 'react';
import { PageWrapper, CardWrapper } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { Plus, Filter, LayoutTemplate, Briefcase, Tags, Search } from 'lucide-react';
import { getKPITemplates, createKPITemplate } from '@/app/actions/kpi';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function KPITemplatesPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDept, setSelectedDept] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Filter Options
    const departments = ["All", "Sales", "Marketing", "Engineering", "HR", "Finance", "Operations", "Projects", "Safety", "Design", "Quality", "R&D"];

    const [newTemplate, setNewTemplate] = useState({
        name: '', industry: 'Construction', department: 'Operations',
        unit: 'Count', defaultTarget: '', frequency: 'Monthly', description: ''
    });

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const res = await getKPITemplates({});
            if (res.success && res.data) {
                setTemplates(res.data);
            }
        } catch (error) {
            toast.error("Failed to load templates");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newTemplate.name) return toast.error("Template name is required");
        setIsCreating(true);
        try {
            const res = await createKPITemplate(newTemplate as any);
            if (res.success) {
                toast.success("Template created successfully");
                setShowModal(false);
                loadTemplates();
                setNewTemplate({
                    name: '', industry: 'Construction', department: 'Operations',
                    unit: 'Count', defaultTarget: '', frequency: 'Monthly', description: ''
                });
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Failed to create template");
        } finally {
            setIsCreating(false);
        }
    };

    const filteredTemplates = templates.filter(t => {
        const matchesDept = selectedDept === 'All' || t.department === selectedDept;
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.industry.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesDept && matchesSearch;
    });

    return (
        <PageWrapper className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">KPI Library & Templates</h1>
                    <p className="text-gray-500">Standardize performance tracking with industry-best templates.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={showModal} onOpenChange={setShowModal}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 shadow-lg shadow-primary/20">
                                <Plus className="w-4 h-4" /> Create Template
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Add New KPI Template</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">KPI Name</label>
                                    <input
                                        className="w-full p-2 border rounded-md"
                                        placeholder="e.g., Monthly Sales Growth"
                                        value={newTemplate.name}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Industry</label>
                                        <input
                                            className="w-full p-2 border rounded-md"
                                            placeholder="Ex: Construction"
                                            value={newTemplate.industry}
                                            onChange={(e) => setNewTemplate({ ...newTemplate, industry: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Department</label>
                                        <select
                                            aria-label="Filter by Department"
                                            className="w-full p-2 border rounded-md"
                                            value={newTemplate.department}
                                            onChange={(e) => setNewTemplate({ ...newTemplate, department: e.target.value })}
                                        >
                                            {departments.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Unit</label>
                                        <select
                                            aria-label="Filter by Unit"
                                            className="w-full p-2 border rounded-md"
                                            value={newTemplate.unit}
                                            onChange={(e) => setNewTemplate({ ...newTemplate, unit: e.target.value })}
                                        >
                                            <option value="Count">Count</option>
                                            <option value="Percentage">Percentage (%)</option>
                                            <option value="Currency">Currency (₹)</option>
                                            <option value="Time">Time (Days/Hrs)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Frequency</label>
                                        <select
                                            aria-label="Filter by Frequency"
                                            className="w-full p-2 border rounded-md"
                                            value={newTemplate.frequency}
                                            onChange={(e) => setNewTemplate({ ...newTemplate, frequency: e.target.value })}
                                        >
                                            <option value="Weekly">Weekly</option>
                                            <option value="Monthly">Monthly</option>
                                            <option value="Quarterly">Quarterly</option>
                                            <option value="Project">Project</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description (Optional)</label>
                                    <textarea
                                        className="w-full p-2 border rounded-md"
                                        placeholder="Explain how to measure this..."
                                        rows={3}
                                        value={newTemplate.description}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                                    />
                                </div>
                                <Button className="w-full" onClick={handleCreate} disabled={isCreating}>
                                    {isCreating ? "Saving..." : "Save Template"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-white/50 border border-gray-200 rounded-xl backdrop-blur-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        placeholder="Search templates by name or industry..."
                        className="w-full pl-9 p-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 min-w-[200px]">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                        aria-label="Select Department"
                        className="flex-1 bg-white border border-gray-200 rounded-lg p-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                    >
                        {departments.map(d => <option key={d} value={d}>{d} Dept</option>)}
                    </select>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading library...</div>
            ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-20 bg-background rounded-xl border border-dashed text-gray-500">
                    No templates found matching your search.
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((t) => (
                        <CardWrapper key={t._id} className="glass-card p-6 rounded-xl hover:shadow-lg transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-white text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <LayoutTemplate className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold px-2 py-1 bg-white text-gray-600 rounded-full">
                                    {t.frequency}
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">{t.name}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{t.description || "No description provided."}</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-background px-2 py-1 rounded-md border">
                                    <Briefcase className="w-3 h-3" /> {t.industry}
                                </span>
                                <span className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-background px-2 py-1 rounded-md border">
                                    <Tags className="w-3 h-3" /> {t.department}
                                </span>
                            </div>

                            <Button variant="outline" className="w-full text-xs h-9">
                                Use This Template
                            </Button>
                        </CardWrapper>
                    ))}
                </div>
            )}
        </PageWrapper>
    );
}
