"use client";

import { use, useEffect, useState } from 'react';
import { ArrowLeft, Calendar, CheckCircle2, Clock, LayoutDashboard, Loader2, MapPin, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { getProjectById } from '@/app/actions/project';
import { getProjectTemplateByName } from '@/app/actions/project-templates';

export default function ProjectDashboard({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [project, setProject] = useState<any>(null);
    const [stages, setStages] = useState<any[]>([]);
    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await getProjectById(id);
            if (res.success && res.data) {
                const proj = res.data;
                setProject(proj);

                if (proj.template) {
                    const tRes = await getProjectTemplateByName(proj.template);
                    if (tRes.success && tRes.data) {
                        const sortedStages = [...(tRes.data.stages || [])].sort((a, b) => a.order - b.order);
                        setStages(sortedStages);
                        // Prefer localStorage value (set by stages page) over progress-derived index
                        const saved = localStorage.getItem(`project-stage-index-${id}`);
                        if (saved !== null) {
                            setCurrentStageIndex(parseInt(saved, 10));
                        } else {
                            const idx = Math.min(
                                Math.floor((proj.progress / 100) * sortedStages.length),
                                sortedStages.length - 1
                            );
                            setCurrentStageIndex(idx);
                        }
                    }
                }
            }
            setLoading(false);
        };
        load();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-4">
                <p className="text-muted-foreground">Project not found.</p>
                <Link href="/projects/list" className="text-sm text-blue-600 hover:underline">Back to Projects</Link>
            </div>
        );
    }

    const dueDate = project.endDate
        ? new Date(project.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'No Due Date';

    return (
        <div className="w-full max-w-full space-y-3 overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <Link href="/projects/list" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Projects
                </Link>

                <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-lg font-bold text-gray-900 truncate">{project.name}</h1>
                            <span className="px-2 py-0.5 bg-white text-blue-700 text-xs font-semibold rounded-full border border-border shrink-0">
                                {project.status}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {project.client}
                            </div>
                            {project.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {project.location}
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Due: {dueDate}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-background transition-colors flex items-center gap-1.5">
                            <Settings className="w-3.5 h-3.5" />
                            Settings
                        </button>
                        <Link
                            href={`/projects/${id}/stages`}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            Full Workflow
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stage Chain Widget */}
            {stages.length > 0 && (
                <div className="w-full min-w-0 glass-card p-4 rounded-2xl border border-gray-200 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">Project Workflow</h2>
                            <p className="text-xs text-gray-500">
                                Template: <span className="text-blue-600 font-medium">{project.template}</span>
                                {stages[currentStageIndex] && (
                                    <> &mdash; Current: <span className="text-blue-600 font-medium">{stages[currentStageIndex].name}</span></>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Scrollable stages — overflow-x-auto must be on a width-constrained element */}
                    <div className="overflow-x-auto w-full">
                        <div className="flex gap-4 px-1 py-2" style={{ width: 'max-content' }}>
                            {stages.map((stage: any, index: number) => {
                                const isCompleted = index < currentStageIndex;
                                const isCurrent = index === currentStageIndex;

                                return (
                                    <Link
                                        key={stage.id}
                                        href={`/projects/${id}/stages/${stage.id}`}
                                        className="group flex flex-col items-center w-[100px] cursor-pointer"
                                    >
                                        {/* Indicator */}
                                        <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-300 bg-white
                                            ${isCompleted ? 'border-green-500 text-green-500' :
                                                isCurrent ? 'border-blue-600 text-blue-600 shadow-md ring-2 ring-blue-100' :
                                                    'border-gray-200 text-gray-300 group-hover:border-gray-300'}`
                                        }>
                                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> :
                                                isCurrent ? <Clock className="w-5 h-5 animate-pulse" /> :
                                                    <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />}
                                        </div>

                                        {/* Label */}
                                        <div className="mt-2 text-center">
                                            <p className={`text-[10px] font-bold uppercase tracking-wide
                                                ${isCurrent ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                                Stage {index + 1}
                                            </p>
                                            <p className={`text-[11px] font-medium mt-0.5 w-[100px] truncate text-center
                                                ${isCurrent ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-800'}`}>
                                                {stage.name}
                                            </p>
                                            {isCurrent && (
                                                <span className="mt-1 inline-block text-[9px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* No template message */}
            {stages.length === 0 && (
                <div className="glass-card p-6 rounded-2xl border border-dashed border-gray-300 text-center text-sm text-muted-foreground">
                    No template assigned. <Link href="/masters/project-templates" className="text-blue-600 hover:underline">Set up a template in Masters</Link> and assign it when creating a project.
                </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="glass-card p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                    <h3 className="text-gray-500 text-xs font-medium mb-2">Team Members</h3>
                    <div className="flex -space-x-3 mb-4">
                        {(project.teamMembers || []).slice(0, 4).map((member: any, i: number) => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-background flex items-center justify-center text-xs font-bold text-gray-600">
                                {typeof member === 'string' ? member.charAt(0).toUpperCase() : '?'}
                            </div>
                        ))}
                        {(project.teamMembers || []).length === 0 && (
                            <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">0</div>
                        )}
                    </div>
                    <p className="text-sm text-blue-600 font-medium">Manage Team &rarr;</p>
                </div>

                <div className="glass-card p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                    <h3 className="text-gray-500 text-xs font-medium mb-2">Progress</h3>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-bold text-gray-900">{project.progress ?? 0}%</span>
                        <span className="text-sm text-gray-500 mb-1">completed</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${project.progress ?? 0}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Due: {dueDate}</p>
                </div>

                <div className="glass-card p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                    <h3 className="text-gray-500 text-xs font-medium mb-2">My Tasks</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <input type="checkbox" aria-label="Review CAD drawings" className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                            <span className="text-sm text-gray-700">Review CAD drawings</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" aria-label="Approve Material Bill" className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                            <span className="text-sm text-gray-700">Approve Material Bill</span>
                        </div>
                    </div>
                    <p className="text-sm text-blue-600 font-medium mt-4">View All Tasks &rarr;</p>
                </div>
            </div>
        </div>
    );
}
