"use client";

import { use } from 'react';
import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Clock, MoreHorizontal, Plus, Settings } from 'lucide-react';
import Link from 'next/link';
import { MOCK_PROJECT_TEMPLATES } from '@/lib/mock-data';

// Mock data integration
// In a real app, this would be fetched based on the Project ID and its assigned Template
const PROJECT_STAGES = MOCK_PROJECT_TEMPLATES[0].stages;

export default function ProjectStagesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    // State to manage stages for this specific project (allowing customization)
    const [stages, setStages] = useState(PROJECT_STAGES);

    // Mock progress calculation
    const currentStageIndex = 3; // Architectural Planning

    const [showImportModal, setShowImportModal] = useState(false);

    const handleImport = (templateId: number) => {
        const template = MOCK_PROJECT_TEMPLATES.find(t => t.id === templateId);
        if (template) {
            // Append new stages with unique IDs
            const newStages = template.stages.map(s => ({ ...s, id: `${s.id}-${Date.now()}` }));
            setStages([...stages, ...newStages]);
        }
        setShowImportModal(false);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/projects/list" className="p-2 hover:bg-background rounded-full transition-colors text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Project Stages</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Project #{id}</span>
                        <span>•</span>
                        <span className="text-blue-600 font-medium">Architectural Design Flow</span>
                    </div>
                </div>
                <div className="ml-auto flex gap-2">
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-background transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Import Workflow
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white text-white rounded-lg text-sm font-medium hover:bg-white transition-colors">
                        <Settings className="w-4 h-4" />
                        Manage Configuration
                    </button>
                </div>
            </div>

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Import Workflow</h3>
                            <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500">Select a template to append its stages to the current project flow.</p>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {MOCK_PROJECT_TEMPLATES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => handleImport(t.id)}
                                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-white transition-all group"
                                >
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-700">{t.name}</h4>
                                        <span className="text-xs bg-background text-gray-600 px-2 py-1 rounded group-hover:bg-white">{t.stages.length} Stages</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Timeline / Stage Chain */}
            <div className="relative">
                {/* Connecting Line */}
                <div className="absolute left-[22px] top-8 bottom-8 w-0.5 bg-white"></div>

                <div className="space-y-6">
                    {stages.map((stage: any, index: number) => {
                        const isCompleted = index < currentStageIndex;
                        const isCurrent = index === currentStageIndex;
                        const isFuture = index > currentStageIndex;

                        return (
                            <div key={stage.id} className="relative flex gap-6 group">
                                {/* Status Indicator */}
                                <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 transition-colors bg-white
                                    ${isCompleted ? 'border-border text-green-600' :
                                        isCurrent ? 'border-border text-blue-600' :
                                            'border-gray-100 text-gray-300'}`
                                }>
                                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> :
                                        isCurrent ? <Clock className="w-6 h-6 animate-pulse" /> :
                                            <Circle className="w-6 h-6" />}
                                </div>

                                {/* Stage Content Card */}
                                <div className={`flex-1 glass-card p-5 rounded-xl border transition-all
                                    ${isCurrent ? 'border-blue-200 shadow-md ring-1 ring-blue-50' : 'border-gray-200 hover:border-gray-300'}`
                                }>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className={`text-lg font-bold ${isCompleted ? 'text-gray-900' : isCurrent ? 'text-blue-700' : 'text-gray-500'}`}>
                                                {stage.name}
                                            </h3>
                                            <div className="flex gap-2 mt-2">
                                                {stage.modules.map((mod: string) => (
                                                    <span key={mod} className="text-xs font-medium px-2 py-0.5 rounded bg-background text-gray-600 border border-gray-200">
                                                        {mod}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <button aria-label="Menu" className="p-1 text-gray-400 hover:text-gray-600 rounded">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Action Area Placeholder */}
                                    {isCurrent && (
                                        <div className="mt-4 p-4 bg-white/50 rounded-lg border border-border">
                                            <p className="text-sm text-blue-800 font-medium mb-2">Active Tasks</p>
                                            <div className="h-2 bg-blue-100 rounded-full overflow-hidden w-full max-w-xs">
                                                <div className="h-full bg-white0 w-[60%]"></div>
                                            </div>
                                            <div className="mt-3 flex gap-2">
                                                <button className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 text-xs font-semibold rounded-md shadow-sm hover:bg-white">
                                                    Open Dashboard
                                                </button>
                                                <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md shadow-sm hover:bg-blue-700">
                                                    Mark Complete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Insert Between Action (Hover) */}
                                <div className="absolute -bottom-5 left-[22px] -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-blue-600 hover:border-blue-300 shadow-sm" title="Insert Stage Here" aria-label="Insert Stage Here">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
