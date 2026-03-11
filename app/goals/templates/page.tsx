"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageWrapper, CardWrapper } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { Plus, Filter, LayoutTemplate, Tags, Search, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { getKPITemplates, createKPITemplate, updateKPITemplate, deleteKPITemplate } from '@/app/actions/kpi';
import { getDepartments } from '@/app/actions/organization';
import { toast } from 'sonner';

const emptyTemplate = {
    id: '',
    name: '',
    department: '',
    description: ''
};

export default function KPITemplatesPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDept, setSelectedDept] = useState('All');
    
    // View state
    const [view, setView] = useState<'list' | 'form'>('list');
    const [isSaving, setIsSaving] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<any>(emptyTemplate);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const deptRes = await getDepartments();
            const tplRes = await getKPITemplates({ search: searchQuery, department: selectedDept });
            
            if (deptRes && Array.isArray(deptRes)) {
                setDepartments(deptRes);
            }
            if (tplRes.success && tplRes.data) {
                setTemplates(tplRes.data);
            }
        } catch (_error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchTemplates = async () => {
             const tplRes = await getKPITemplates({ search: searchQuery, department: selectedDept });
             if (tplRes.success && tplRes.data) {
                 setTemplates(tplRes.data);
             }
        }
        fetchTemplates();
    }, [searchQuery, selectedDept]);

    const openCreate = () => {
        setEditingTemplate(emptyTemplate);
        setView('form');
    };

    const openEdit = (template: any) => {
        setEditingTemplate({
            id: template._id || template.id,
            name: template.name || '',
            department: template.department || '',
            description: template.description || ''
        });
        setView('form');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTemplate.name) return toast.error("Template name is required");
        if (!editingTemplate.department) return toast.error("Department is required");
        
        setIsSaving(true);
        try {
            const res = editingTemplate.id
                ? await updateKPITemplate(editingTemplate as any)
                : await createKPITemplate(editingTemplate as any);

            if (res.success) {
                toast.success(editingTemplate.id ? "Template updated" : "Template created successfully");
                setView('list');
                setEditingTemplate(emptyTemplate);
                loadData();
            } else {
                toast.error(res.error || 'Failed to save template');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this template?")) return;
        const res = await deleteKPITemplate(id);
        if (res.success) {
            toast.success('Template deleted');
            loadData();
        } else {
            toast.error(res.error || 'Failed to delete template');
        }
    };

    if (view === 'form') {
        return (
            <PageWrapper className="space-y-6 max-w-4xl mx-auto">
                <div className="flex flex-col gap-1 mb-4">
                    <Button variant="ghost" className="w-fit text-muted-foreground hover:text-foreground pl-0 mb-2 gap-2" onClick={() => setView('list')}>
                        <ArrowLeft className="w-4 h-4" /> Back to templates
                    </Button>
                    <h1 className="text-3xl font-bold text-foreground">
                        {editingTemplate.id ? 'Edit KPI Template' : 'Create New KPI Template'}
                    </h1>
                    <p className="text-muted-foreground">Define a standard metric parameter for departments to adopt.</p>
                </div>

                <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
                    <form onSubmit={handleSave} className="space-y-8">
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold flex items-center gap-2 border-b pb-4">
                                <LayoutTemplate className="w-5 h-5 text-primary" />
                                KPI Configuration
                            </h2>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">KPI Name <span className="text-destructive">*</span></label>
                                <input
                                    required
                                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                                    placeholder="e.g., Target Revenue Generated"
                                    value={editingTemplate.name}
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground mt-1">A clear, actionable name for this metric.</p>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="text-sm font-semibold text-foreground">Department <span className="text-destructive">*</span></label>
                                <select
                                    required
                                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                                    value={editingTemplate.department}
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, department: e.target.value })}
                                >
                                    <option value="" disabled>Select a department</option>
                                    {departments.map((dept) => (
                                        <option key={dept._id || dept.id} value={dept.name}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="text-sm font-semibold text-foreground">Description</label>
                                <textarea
                                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 min-h-[160px] resize-y"
                                    placeholder="Explain the purpose of this KPI, how it's measured, and any other relevant guidelines..."
                                    value={editingTemplate.description}
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setView('list')} disabled={isSaving}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSaving} className="min-w-[150px] font-medium shadow-lg shadow-primary/20">
                                {isSaving ? "Saving..." : "Save Template"}
                            </Button>
                        </div>
                    </form>
                </div>
            </PageWrapper>
        );
    }

    // List View
    return (
        <PageWrapper className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">KPI Library & Templates</h1>
                    <p className="text-muted-foreground mt-1">Standardize performance tracking with reusable KPI definitions.</p>
                </div>
                <Button className="gap-2 shadow-lg shadow-primary/20" onClick={openCreate}>
                    <Plus className="w-5 h-5" /> Create Template
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 p-4 bg-card border border-border rounded-xl shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        placeholder="Search templates by name or department..."
                        className="w-full pl-9 p-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 min-w-[200px]">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <select
                        aria-label="Select Department Filter"
                        className="flex-1 bg-background border border-border rounded-lg p-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                    >
                        <option value="All">All Departments</option>
                        {departments.map((dept) => (
                            <option key={dept._id || dept.id} value={dept.name}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-24 text-muted-foreground">Loading library...</div>
            ) : templates.length === 0 ? (
                <div className="text-center py-24 bg-card rounded-xl border border-dashed border-border shadow-sm text-muted-foreground">
                    No templates found matching your criteria.
                </div>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <CardWrapper key={template._id || template.id} className="glass-card p-6 rounded-xl hover:shadow-lg hover:border-primary/20 transition-all group flex flex-col h-full bg-card">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                    <LayoutTemplate className="w-5 h-5" />
                                </div>
                            </div>
                            <h3 className="font-bold text-foreground mb-2.5 text-lg">{template.name}</h3>
                            
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-accent/50 px-2.5 py-1.5 rounded-md border border-border w-fit mb-4">
                                <Tags className="w-3.5 h-3.5" /> {template.department}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-8 line-clamp-3 flex-1 leading-relaxed">
                                {template.description || "No description provided."}
                            </p>

                            <div className="grid grid-cols-3 gap-3 mt-auto pt-4 border-t border-border/50">
                                <Link
                                    href={`/goals/plan?template=${template._id || template.id}`}
                                    className="inline-flex h-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                                >
                                    Use
                                </Link>
                                <Button variant="outline" className="text-xs h-9 font-semibold rounded-lg hover:bg-accent" onClick={() => openEdit(template)}>
                                    <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                                </Button>
                                <Button variant="outline" className="text-xs h-9 font-semibold text-destructive rounded-lg hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200" onClick={() => handleDelete(template._id || template.id)}>
                                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                                </Button>
                            </div>
                        </CardWrapper>
                    ))}
                </div>
            )}
        </PageWrapper>
    );
}
