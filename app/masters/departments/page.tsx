"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Building2, Briefcase, Filter, Loader2, MoreVertical, Edit, Trash2, LayoutGrid, List } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/components/ui/toaster';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, getSubsidiaries } from '@/app/actions/organization';

interface Department {
    _id?: string;
    id?: string;
    name: string;
    code: string;
    subsidiaryId: string | { _id: string, name: string }; // Populated or ID
    headOfDepartment?: string;
    teamCount?: number; // Optional until implemented
}

interface Subsidiary {
    _id: string;
    name: string;
}

export default function DepartmentsMaster() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [currentDept, setCurrentDept] = useState<Department | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubFilter, setSelectedSubFilter] = useState<string>('All Subsidiaries');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        subsidiaryId: '',
        headOfDepartment: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
        const savedView = localStorage.getItem('departmentsViewMode');
        if (savedView === 'grid' || savedView === 'list') {
            setViewMode(savedView);
        }
    }, []);

    const toggleViewMode = (mode: 'grid' | 'list') => {
        setViewMode(mode);
        localStorage.setItem('departmentsViewMode', mode);
    };

    const loadData = async () => {
        setLoading(true);
        const [deptsData, subsData] = await Promise.all([
            getDepartments(),
            getSubsidiaries()
        ]);
        setDepartments(deptsData || []);
        setSubsidiaries(subsData || []);
        setLoading(false);
    };

    const handleOpenSheet = (dept?: Department) => {
        if (dept) {
            setCurrentDept(dept);
            setFormData({
                name: dept.name,
                code: dept.code,
                subsidiaryId: typeof dept.subsidiaryId === 'object' ? dept.subsidiaryId._id : dept.subsidiaryId,
                headOfDepartment: dept.headOfDepartment || ''
            });
        } else {
            setCurrentDept(null);
            setFormData({ name: '', code: '', subsidiaryId: '', headOfDepartment: '' });
        }
        setIsSheetOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let res;
            if (currentDept && (currentDept._id || currentDept.id)) {
                res = await updateDepartment({ ...formData, id: currentDept._id || currentDept.id });
            } else {
                res = await createDepartment(formData);
            }

            if (res.success) {
                toast.success(currentDept ? "Department updated" : "Department created");
                setIsSheetOpen(false);
                loadData();
            } else {
                toast.error(res.error || "Operation failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this department?")) {
            const res = await deleteDepartment({ id });
            if (res.success) {
                toast.success("Department deleted");
                loadData();
            } else {
                toast.error(res.error || "Failed to delete");
            }
        }
    };

    const filteredDepartments = departments.filter(dept => {
        const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dept.code.toLowerCase().includes(searchQuery.toLowerCase());
        const subName = typeof dept.subsidiaryId === 'object' ? dept.subsidiaryId.name : '';
        const matchesSub = selectedSubFilter === 'All Subsidiaries' || subName === selectedSubFilter;
        return matchesSearch && matchesSub;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
                    <p className="text-gray-500">Configure functional units within subsidiaries.</p>
                </div>
                <Button onClick={() => handleOpenSheet()} className="bg-primary hover:bg-primary/90 shadow-md shadow-green-200">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Department
                </Button>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm items-center">
                <div className="relative flex-1 w-full md:w-auto">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search departments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <Select value={selectedSubFilter} onValueChange={setSelectedSubFilter}>
                        <SelectTrigger className="w-[200px] bg-background border-gray-200">
                            <SelectValue placeholder="All Entities" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="All Subsidiaries">All Entities</SelectItem>
                            {subsidiaries.map(sub => (
                                <SelectItem key={sub._id} value={sub.name}>{sub.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center border rounded-lg overflow-hidden shrink-0">
                    <button
                        onClick={() => toggleViewMode('grid')}
                        className={`p-2.5 ${viewMode === 'grid' ? 'bg-white text-gray-900' : 'bg-white text-gray-500 hover:text-gray-900'}`}
                        title="Grid View"
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <div className="w-px h-10 bg-white" />
                    <button
                        onClick={() => toggleViewMode('list')}
                        className={`p-2.5 ${viewMode === 'list' ? 'bg-white text-gray-900' : 'bg-white text-gray-500 hover:text-gray-900'}`}
                        title="List View"
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content View */}
            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
            ) : filteredDepartments.length === 0 ? (
                <p className="text-center text-gray-500 py-10 bg-white rounded-xl border border-dashed">No departments found.</p>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredDepartments.map((dept) => (
                                <div key={dept._id || dept.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-all group flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-md">
                                                <Briefcase className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 line-clamp-1">{dept.name}</h3>
                                                <span className="text-xs font-mono text-gray-500 bg-white px-1.5 py-0.5 rounded inline-block mt-0.5">
                                                    {dept.code}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-2 space-y-2 flex-grow">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Building2 className="w-4 h-4 text-gray-400" />
                                            <span className="line-clamp-1">{typeof dept.subsidiaryId === 'object' ? dept.subsidiaryId.name : 'Unknown'}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 border-t pt-2 mt-2">
                                            <span className="uppercase tracking-wider text-[10px] font-bold text-gray-400">Head of Dept.</span>
                                            <p className="font-medium text-gray-700 truncate">{dept.headOfDepartment || 'Not Assigned'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                            onClick={() => handleOpenSheet(dept)}
                                        >
                                            <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDelete(dept._id || dept.id!)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-background border-b">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Code</th>
                                            <th className="px-6 py-3 font-medium">Department Name</th>
                                            <th className="px-6 py-3 font-medium">Entity</th>
                                            <th className="px-6 py-3 font-medium">Head of Dept.</th>
                                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredDepartments.map((dept) => (
                                            <tr key={dept._id || dept.id} className="hover:bg-background/50">
                                                <td className="px-6 py-3 font-mono text-gray-600">{dept.code}</td>
                                                <td className="px-6 py-3 font-medium text-gray-900">{dept.name}</td>
                                                <td className="px-6 py-3 text-gray-600">{typeof dept.subsidiaryId === 'object' ? dept.subsidiaryId.name : 'Unknown'}</td>
                                                <td className="px-6 py-3 text-gray-600">{dept.headOfDepartment || '-'}</td>
                                                <td className="px-6 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:bg-amber-50 rounded-full" onClick={() => handleOpenSheet(dept)}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-full" onClick={() => handleDelete(dept._id || dept.id!)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Create/Edit Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>{currentDept ? 'Edit Department' : 'Add Department'}</SheetTitle>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                        <div className="space-y-2">
                            <Label>Entity</Label>
                            <Select
                                value={formData.subsidiaryId}
                                onValueChange={(val: string) => setFormData({ ...formData, subsidiaryId: val })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Entity" />
                                </SelectTrigger>
                                <SelectContent className="bg-white z-[100]">
                                    {subsidiaries.map(sub => (
                                        <SelectItem key={sub._id} value={sub._id}>{sub.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Department Name</Label>
                            <Input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Design Studio"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Department Code</Label>
                            <Input
                                required
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                placeholder="e.g. DS-01"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Head of Department</Label>
                            <Input
                                value={formData.headOfDepartment}
                                onChange={e => setFormData({ ...formData, headOfDepartment: e.target.value })}
                                placeholder="Full Name"
                            />
                        </div>

                        <SheetFooter>
                            <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Save Changes
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
}
