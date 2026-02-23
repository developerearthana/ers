"use client";

import { useEffect, useState } from 'react';
import { Briefcase, CheckCircle2, Clock, AlertTriangle, ArrowRight, MoreHorizontal, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getProjectStats } from '@/app/actions/project';
import { toast } from 'sonner';

interface Project {
    id: string;
    name: string;
    client: string;
    status: string;
    progress: number;
    dueDate: string;
    members: number;
    image: string;
}

interface Stats {
    total: number;
    completed: number;
    inProgress: number;
    atRisk: number;
}

export default function ProjectsDashboard() {
    const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, inProgress: 0, atRisk: 0 });
    const [activeProjects, setActiveProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getProjectStats();
                if (res.success && res.data) {
                    setStats({
                        total: res.data.total,
                        completed: res.data.completed,
                        inProgress: res.data.inProgress,
                        atRisk: res.data.atRisk
                    });
                    setActiveProjects(res.data.activeProjects);
                } else {
                    toast.error("Failed to fetch project stats");
                }
            } catch (error) {
                toast.error("Error loading dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const statCards = [
        { label: "Total Projects", value: stats.total, sub: "Active", icon: Briefcase, color: "bg-white", textColor: "text-blue-600", border: "border-border" },
        { label: "Completed", value: stats.completed, sub: "This Year", icon: CheckCircle2, color: "bg-white", textColor: "text-green-600", border: "border-border" },
        { label: "In Progress", value: stats.inProgress, sub: "On Track", icon: Clock, color: "bg-white", textColor: "text-purple-600", border: "border-border" },
        { label: "At Risk", value: stats.atRisk, sub: "Needs Attention", icon: AlertTriangle, color: "bg-red-50", textColor: "text-red-600", border: "border-red-100" },
    ];

    return (
        <PageWrapper className="space-y-6 max-w-7xl mx-auto p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Projects Overview</h1>
                    <p className="text-muted-foreground mt-1">Manage and track ongoing project progress.</p>
                </div>
                <Button className="shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={cn("glass-card p-5 rounded-xl border flex flex-col justify-between h-32 hover:shadow-md transition-all", stat.border)}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                            </div>
                            <div className={cn("p-2 rounded-lg", stat.color)}>
                                <stat.icon className={cn("w-5 h-5", stat.textColor)} />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            {stat.textColor === "text-red-600" ?
                                <AlertTriangle className="w-3 h-3 text-red-400" /> :
                                <ArrowRight className="w-3 h-3 text-gray-400" />
                            }
                            {stat.sub}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Projects List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card rounded-xl overflow-hidden border border-white/40 shadow-xl bg-white/40 backdrop-blur-xl"
            >
                <div className="p-6 border-b border-gray-100/50 flex items-center justify-between bg-white/50">
                    <h3 className="font-bold text-gray-900">Active Projects</h3>
                    <div className="flex gap-2">
                        <select aria-label="Filter by Status" className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer font-medium text-gray-600">
                            <option>All Status</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/50 text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Project Name</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Progress</th>
                                <th className="px-6 py-4 font-semibold">Due Date</th>
                                <th className="px-6 py-4 font-semibold">Team</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50">
                            {activeProjects.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-muted-foreground">No active projects found.</td>
                                </tr>
                            ) : (
                                activeProjects.map((project) => (
                                    <tr key={project.id} className="hover:bg-white/60 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-sm", project.image)}>
                                                    {project.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 line-clamp-1">{project.name}</div>
                                                    <div className="text-xs text-muted-foreground line-clamp-1">{project.client}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border",
                                                project.status === 'In Progress' ? 'bg-white text-blue-700 border-border' :
                                                    project.status === 'Completed' ? 'bg-white text-green-700 border-border' :
                                                        project.status === 'At Risk' ? 'bg-red-50 text-red-700 border-red-100' :
                                                            'bg-background text-gray-700 border-gray-100'
                                            )}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 w-48">
                                            <div className="flex items-center gap-3">
                                                <Progress value={project.progress} className="h-1.5"
                                                    indicatorClassName={project.progress >= 70 ? 'bg-white0' : project.progress >= 40 ? 'bg-white0' : 'bg-red-500'}
                                                />
                                                <span className="text-xs font-bold text-gray-600 w-8">{project.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            <div className="flex items-center gap-1.5 text-xs bg-background px-2 py-1 rounded-md w-fit text-gray-500">
                                                <Clock className="w-3.5 h-3.5" />
                                                {project.dueDate}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex -space-x-2">
                                                {[...Array(Math.min(3, project.members || 1))].map((_, i) => (
                                                    <div key={i} className="w-7 h-7 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-[10px] text-gray-600 font-bold">
                                                        U{i + 1}
                                                    </div>
                                                ))}
                                                {project.members > 3 && (
                                                    <div className="w-7 h-7 rounded-full bg-background border-2 border-white flex items-center justify-center text-[10px] text-gray-500 font-bold shadow-sm">
                                                        +{project.members - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-primary hover:bg-white rounded-full transition-all">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </PageWrapper>
    );
}
