"use client";

import { Plus, Search, Filter, MoreHorizontal, Calendar, Users, Download, Printer, LayoutList, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';
import { exportToCSV, handlePrint } from '@/lib/export-utils';
import { getProjects, createProject } from '@/app/actions/project';
import { toast } from 'sonner';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProjectListPage() {
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newProject, setNewProject] = useState({ name: '', client: '', status: 'Planning', template: '' });

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const res = await getProjects({});
            if (res.success && res.data) {
                setProjects(res.data);
            }
        } catch (error) {
            toast.error("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async () => {
        if (!newProject.name || !newProject.client) {
            toast.error("Name and Client are required");
            return;
        }

        try {
            const res = await createProject(newProject);
            if (res.success) {
                toast.success("Project created successfully");
                setShowNewProjectModal(false);
                loadProjects();
                setNewProject({ name: '', client: '', status: 'Planning', template: '' });
            } else {
                toast.error(res.error || "Failed to create project");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <PageWrapper className="space-y-6 max-w-7xl mx-auto p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">Project List</h1>
                    <p className="text-muted-foreground mt-1">Manage and track all ongoing and completed projects.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => exportToCSV(projects, 'projects-list')} className="gap-2">
                        <Download className="w-4 h-4" /> Export
                    </Button>
                    <Button variant="outline" onClick={handlePrint} className="gap-2">
                        <Printer className="w-4 h-4" /> Print
                    </Button>
                    <Button onClick={() => setShowNewProjectModal(true)} className="shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4 mr-2" /> New Project
                    </Button>
                </div>
            </div>

            {/* New Project Modal - Simplified inline for now, ideally strictly separate component */}
            {showNewProjectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-gray-900">Start New Project</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter project name"
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={newProject.name}
                                    onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter client name"
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={newProject.client}
                                    onChange={e => setNewProject({ ...newProject, client: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                                <select
                                    aria-label="Select Project Template"
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                                    value={newProject.template}
                                    onChange={(e) => setNewProject({ ...newProject, template: e.target.value })}
                                >
                                    <option value="">No Template</option>
                                    <option value="Architectural Design Flow">Architectural Design Flow</option>
                                    <option value="Interior Renovation">Interior Renovation</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2 gap-2">
                            <Button variant="ghost" onClick={() => setShowNewProjectModal(false)}>Cancel</Button>
                            <Button onClick={handleCreateProject}>Create Project</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between border border-white/40 shadow-sm">
                <div className="relative flex-1 w-full md:max-w-md group">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white/50 focus:bg-white transition-all text-sm"
                        onChange={(e) => loadProjects()}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="gap-2 text-gray-600">
                        <Filter className="w-4 h-4" /> Filter
                    </Button>
                    <select aria-label="Status Filter" className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 focus:outline-none bg-white cursor-pointer hover:bg-background">
                        <option>All Status</option>
                        <option>In Progress</option>
                        <option>Planning</option>
                        <option>Completed</option>
                    </select>
                </div>
            </div>

            {/* Project List - Table Format */}
            <div className="glass-card rounded-xl overflow-hidden border border-white/40 shadow-xl bg-white/40 backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/50 text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Project Name & Client</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Dates & Team</th>
                                <th className="px-6 py-4 font-semibold">Progress</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50">
                            {projects.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        No projects found. Create one to get started.
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence mode='popLayout'>
                                    {projects.map((project, index) => (
                                        <motion.tr
                                            key={project.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2, delay: index * 0.05 }}
                                            className="hover:bg-white/60 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <Link href={`/projects/${project.id}`}>
                                                    <div className="font-bold text-gray-900 hover:text-primary transition-colors">{project.name}</div>
                                                </Link>
                                                <div className="text-xs text-muted-foreground">{project.client}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn("px-2.5 py-0.5 rounded-md text-xs font-bold border",
                                                    project.status === 'In Progress' ? 'bg-white text-blue-700 border-border' :
                                                        project.status === 'Completed' ? 'bg-white text-green-700 border-border' :
                                                            'bg-amber-50 text-amber-700 border-amber-100'
                                                )}>
                                                    {project.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        Due: {project.due}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="w-3.5 h-3.5" />
                                                        {project.team} Members
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 w-48">
                                                <div className="text-xs font-semibold text-gray-600 mb-1.5 flex justify-between">
                                                    <span>{project.progress}%</span>
                                                </div>
                                                <Progress
                                                    value={project.progress}
                                                    indicatorClassName={project.progress === 100 ? 'bg-white0' : 'bg-blue-600'}
                                                    className="h-1.5"
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700 hover:bg-white">
                                                        <Link href={`/projects/${project.id}`}>View</Link>
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageWrapper>
    );
}
