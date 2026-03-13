"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageWrapper, CardWrapper } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { Plus, Filter, LayoutTemplate, Tags, Search, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { getKPITemplates, createKPITemplate, updateKPITemplate, deleteKPITemplate } from '@/app/actions/kpi';
import { getDepartments, getCompany, getSubsidiaries } from '@/app/actions/organization';
import { toast } from 'sonner';

const emptyTemplate = {
    id: '',
    name: '',
    industry: 'Main Company',
    subsidiary: 'Main Subsidiary',
    department: '',
    description: '',
    unit: 'Count',
    frequency: 'Monthly'
};

export default function KPITemplatesPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [companyList, setCompanyList] = useState<string[]>(['General']);
    const [subsidiaries, setSubsidiaries] = useState<any[]>([]);
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
            const [deptRes, compRes, subRes] = await Promise.all([
                getDepartments(),
                getCompany(),
                getSubsidiaries()
            ]);
            
            if (deptRes && Array.isArray(deptRes)) {
                setDepartments(deptRes);
            }
            if (compRes && compRes.name) {
                setCompanyList(['General', compRes.name]);
            }
            if (Array.isArray(subRes)) {
                setSubsidiaries(subRes);
            }

            const tplRes = await getKPITemplates({ search: searchQuery, department: selectedDept });
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
            industry: template.industry || 'Main Company',
            subsidiary: template.subsidiary || 'Main Subsidiary',
            department: template.department || '',
            description: template.description || '',
            unit: template.unit || 'Count',
            frequency: template.frequency || 'Monthly'
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
                            <h2 className="text-xl font-semibold border-b pb-4">
                                KPI Configuration
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Company</label>
                                    <select
                                        className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                                        value={editingTemplate.industry}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, industry: e.target.value })}
                                    >
                                        {companyList.map(comp => (
                                            <option key={comp} value={comp}>{comp}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Subsidiary</label>
                                    <select
                                        className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                                        value={editingTemplate.subsidiary}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, subsidiary: e.target.value })}
                                    >
                                        <option value="Main Subsidiary">Main Subsidiary</option>
                                        {subsidiaries.map(sub => (
                                            <option key={sub._id || sub.id} value={sub.name}>{sub.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2">
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
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">KPI Name <span className="text-destructive">*</span></label>
                                    <input
                                        required
                                        className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                                        placeholder="e.g., Target Revenue"
                                        value={editingTemplate.name}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Unit</label>
                                    <select
                                        className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                                        value={editingTemplate.unit}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, unit: e.target.value })}
                                    >
                                        {['Count', '%', 'INR', 'USD', 'Hours', 'Days', 'Rating'].map(u => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Frequency</label>
                                    <select
                                        className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                                        value={editingTemplate.frequency}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, frequency: e.target.value as any })}
                                    >
                                        {['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'].map(f => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="text-sm font-semibold text-foreground">Description</label>
                                <textarea
                                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 min-h-[100px] resize-y"
                                    placeholder="Explain the purpose of this KPI..."
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
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-x-auto">
                    <div className="min-w-[1200px]">
                        <div className="grid grid-cols-12 gap-0 px-4 py-3 bg-muted/30 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <div className="col-span-1 border-r border-border px-2">S.No</div>
                            <div className="col-span-2 border-r border-border px-2">KPI Name</div>
                            <div className="col-span-1 border-r border-border px-2">Company</div>
                            <div className="col-span-1 border-r border-border px-2">Subsidiary</div>
                            <div className="col-span-1 border-r border-border px-2">Department</div>
                            <div className="col-span-1 border-r border-border px-2">Unit</div>
                            <div className="col-span-1 border-r border-border px-2">Frequency</div>
                            <div className="col-span-2 border-r border-border px-2">Description</div>
                            <div className="col-span-2 px-2 text-center">Actions</div>
                        </div>
                        <div className="divide-y divide-border">
                            {templates.map((template, index) => (
                                <div 
                                    key={template._id || template.id} 
                                    className="grid grid-cols-12 gap-0 px-4 py-3 items-center hover:bg-muted/10 transition-colors group"
                                >
                                    <div className="col-span-1 text-xs text-muted-foreground border-r border-border h-full flex items-center px-2">
                                        {index + 1}
                                    </div>
                                    <div className="col-span-2 border-r border-border h-full flex items-center px-2">
                                        <span className="font-semibold text-foreground text-[13px]">{template.name}</span>
                                    </div>
                                    <div className="col-span-1 border-r border-border h-full flex items-center px-2">
                                        <span className="text-[12px] text-muted-foreground">{template.industry || '—'}</span>
                                    </div>
                                    <div className="col-span-1 border-r border-border h-full flex items-center px-2">
                                        <span className="text-[12px] text-muted-foreground">{template.subsidiary || '—'}</span>
                                    </div>
                                    <div className="col-span-1 border-r border-border h-full flex items-center px-2">
                                        <span className="text-[12px] text-muted-foreground font-medium">{template.department}</span>
                                    </div>
                                    <div className="col-span-1 border-r border-border h-full flex items-center px-2">
                                        <span className="text-[11px] font-bold text-primary px-2 py-0.5 bg-primary/5 rounded">{template.unit || 'Count'}</span>
                                    </div>
                                    <div className="col-span-1 border-r border-border h-full flex items-center px-2">
                                        <span className="text-[11px] text-muted-foreground">{template.frequency || 'Monthly'}</span>
                                    </div>
                                    <div className="col-span-2 border-r border-border h-full flex items-center px-2">
                                        <p className="text-[12px] text-muted-foreground line-clamp-2 leading-tight">
                                            {template.description || "—"}
                                        </p>
                                    </div>

                                    <div className="col-span-2 flex justify-center items-center gap-1.5 px-2">
                                        <Link
                                            href={`/goals/plan?template=${template._id || template.id}`}
                                            className="h-7 px-3 inline-flex items-center justify-center rounded bg-primary text-primary-foreground text-[11px] font-bold hover:brightness-110"
                                        >
                                            Use
                                        </Link>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-7 px-2 text-[11px] font-bold text-primary hover:bg-primary/10" 
                                            onClick={() => openEdit(template)}
                                        >
                                            Edit
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-7 px-2 text-[11px] font-bold text-red-600 hover:bg-red-50" 
                                            onClick={() => handleDelete(template._id || template.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </PageWrapper>
    );
}
