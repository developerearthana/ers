"use client";

import { use } from 'react';
import { ArrowLeft, Calendar, CheckCircle2, ChevronRight, Clock, LayoutDashboard, MapPin, MoreHorizontal, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { MOCK_PROJECT_TEMPLATES } from '@/lib/mock-data';

// Mock Data for the specific project
// In real app, fetch based on params.id
const PROJECT_DATA = {
    id: 1,
    name: "Eco-Villa Design",
    client: "Green Living Estates",
    location: "Lonavala, MH",
    status: "In Progress",
    templateId: 1, // Architectural Design Flow
    currentStageId: "s4", // Architectural Planning
    startDate: "01 Jan 2024",
    dueDate: "30 Apr 2024",
    team: [
        { name: "Rajesh K.", role: "Lead Architect" },
        { name: "Sarah W.", role: "Civil Engineer" },
        { name: "Amit P.", role: "Interior Designer" }
    ]
};

export default function ProjectDashboard({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    // Get the template stages
    const template = MOCK_PROJECT_TEMPLATES.find(t => t.id === PROJECT_DATA.templateId) || MOCK_PROJECT_TEMPLATES[0];
    const stages = template.stages;

    // Determine stage status
    const currentStageIndex = stages.findIndex(s => s.id === PROJECT_DATA.currentStageId);

    return (
        <div className="max-w-7xl mx-auto space-y-3">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link href="/projects/list" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Projects
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">{PROJECT_DATA.name}</h1>
                            <span className="px-3 py-1 bg-white text-blue-700 text-xs font-semibold rounded-full border border-border">
                                {PROJECT_DATA.status}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                {PROJECT_DATA.client}
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {PROJECT_DATA.location}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Due: {PROJECT_DATA.dueDate}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-background transition-colors flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Settings
                        </button>
                        <Link
                            href={`/projects/${id}/stages`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Full Workflow
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stage Chain Widget */}
            <div className="glass-card p-4 rounded-2xl border border-gray-200 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Project Workflow</h2>
                        <p className="text-xs text-gray-500">Current Stage: <span className="text-blue-600 font-medium">{stages[currentStageIndex]?.name}</span></p>
                    </div>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[22px] left-0 right-0 h-0.5 bg-white z-0"></div>

                    {/* Scrollable Container for Mobile & Desktop - Increased bottom padding for popovers */}
                    <div className="flex overflow-x-auto pb-12 gap-8 min-w-full px-1 pt-2">
                        {stages.map((stage: any, index: number) => {
                            const isCompleted = index < currentStageIndex;
                            const isCurrent = index === currentStageIndex;

                            return (
                                <Link
                                    key={stage.id}
                                    href={`/projects/${id}/stages/${stage.id}`}
                                    className="group relative z-10 flex flex-col items-center min-w-[120px] flex-shrink-0 cursor-pointer"
                                >
                                    {/* Indicator */}
                                    <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 z-10 bg-white
                                        ${isCompleted ? 'border-green-500 text-green-500 hover:scale-110' :
                                            isCurrent ? 'border-blue-600 text-blue-600 shadow-lg scale-110 ring-4 ring-blue-50' :
                                                'border-gray-200 text-gray-300 group-hover:border-gray-300'}`
                                    }>
                                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> :
                                            isCurrent ? <Clock className="w-6 h-6 animate-pulse" /> :
                                                <div className="w-3 h-3 rounded-full bg-white group-hover:bg-white" />}
                                    </div>

                                    {/* Label */}
                                    <div className="mt-3 text-center">
                                        <p className={`text-xs font-bold transition-colors uppercase tracking-wide
                                            ${isCurrent ? 'text-blue-700' :
                                                isCompleted ? 'text-green-700' :
                                                    'text-gray-400 group-hover:text-gray-600'}`
                                        }>
                                            Stage {index + 1}
                                        </p>
                                        <p className={`text-sm font-medium mt-1 truncate max-w-[140px]
                                            ${isCurrent ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-800'}`
                                        }>
                                            {stage.name}
                                        </p>
                                    </div>

                                    {/* Current Stage Popover (Visual Only) */}
                                    {isCurrent && (
                                        <div className="absolute top-full mt-4 bg-white text-white text-xs px-3 py-1.5 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2">
                                            Active Now
                                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="glass-card p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                    <h3 className="text-gray-500 text-xs font-medium mb-2">Team Members</h3>
                    <div className="flex -space-x-3 mb-4">
                        {PROJECT_DATA.team.map((member, i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-background flex items-center justify-center text-xs font-bold text-gray-600" title={member.name}>
                                {member.name.charAt(0)}
                            </div>
                        ))}
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-white flex items-center justify-center text-xs font-bold text-blue-600">
                            +2
                        </div>
                    </div>
                    <p className="text-sm text-blue-600 font-medium">Manage Team &rarr;</p>
                </div>

                <div className="glass-card p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                    <h3 className="text-gray-500 text-xs font-medium mb-2">Progress</h3>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-bold text-gray-900">45%</span>
                        <span className="text-sm text-gray-500 mb-1">completed</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div className="w-[45%] h-full bg-blue-600 rounded-full"></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">On track to finish by Apr 30</p>
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
