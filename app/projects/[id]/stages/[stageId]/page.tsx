"use client";

import { use } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, FileText, Layout, MessageSquare, Plus, Settings } from 'lucide-react';
import Link from 'next/link';
import { MOCK_PROJECT_TEMPLATES } from '@/lib/mock-data';

// Mock Data (Real app would fetch based on IDs)
const PROJECT_DATA = {
    id: 1,
    name: "Eco-Villa Design",
    templateId: 1
};

export default function StageDetailPage({ params }: { params: Promise<{ id: string, stageId: string }> }) {
    const { id, stageId } = use(params);
    const template = MOCK_PROJECT_TEMPLATES.find(t => t.id === PROJECT_DATA.templateId) || MOCK_PROJECT_TEMPLATES[0];
    const stage = template.stages.find(s => s.id === stageId);

    if (!stage) return <div className="p-8">Stage not found</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <Link href={`/projects/${id}`} className="p-2 hover:bg-background rounded-full transition-colors text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/projects/list" className="hover:text-gray-900">Projects</Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link href={`/projects/${id}`} className="hover:text-gray-900">{PROJECT_DATA.name}</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-semibold text-gray-900">{stage.name}</span>
                </div>
            </div>

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{stage.name}</h1>
                    <p className="text-gray-500 mt-1">Manage all activities, documents, and approvals for this phase.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-background transition-colors">
                        Stage Settings
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Complete Stage
                    </button>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Dynamically render modules/widgets enabled for this stage */}
                {stage.modules.map((moduleName: string) => {
                    // Start: Specialized Module Rendering Logic

                    // 1. Civil Work / Construction Checklist Module
                    if (moduleName === "Civil Work" || moduleName === "Structure" || moduleName === "Plastering") {
                        return (
                            <div key={moduleName} className="glass-card p-6 rounded-xl border border-gray-200 hover:shadow-md transition-all col-span-1 md:col-span-2">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Layout className="w-5 h-5 text-orange-600" />
                                        {moduleName} Checklist
                                    </h3>
                                    <span className="text-xs bg-white text-orange-700 px-2 py-1 rounded-full font-medium">Site Activity</span>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        "Material Availability Check",
                                        "Site Clearance & Safety",
                                        "Labour Deployment",
                                        "Quality Inspection"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-background rounded-lg border border-gray-100">
                                            <input type="checkbox" aria-label={item} className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500" />
                                            <span className="text-sm text-gray-700 font-medium">{item}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-2 pt-2 text-sm text-blue-600 font-medium cursor-pointer hover:underline">
                                        <Plus className="w-4 h-4" /> Add Custom Activity
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    // 2. Approvals / Document Signoff Module
                    if (moduleName === "Approvals" || moduleName === "Signoff" || moduleName === "Signatures") {
                        return (
                            <div key={moduleName} className="glass-card p-6 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        {moduleName}
                                    </h3>
                                    <span className="text-xs bg-white text-blue-700 px-2 py-1 rounded-full font-medium">Critical</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="p-3 bg-white rounded-lg border border-border flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="text-sm font-bold text-green-800">Client Approval</p>
                                            <p className="text-xs text-green-600">Signed on 12 Jan 2024</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                                        <Plus className="w-4 h-4" /> Request New Approval
                                    </button>
                                </div>
                            </div>
                        );
                    }

                    // 3. Default Generic Module
                    return (
                        <div key={moduleName} className="glass-card p-6 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900">{moduleName}</h3>
                                <div className="p-2 bg-background text-gray-600 rounded-lg">
                                    {moduleName.includes("Doc") ? <FileText className="w-5 h-5" /> :
                                        moduleName.includes("Chat") ? <MessageSquare className="w-5 h-5" /> :
                                            <Layout className="w-5 h-5" />}
                                </div>
                            </div>

                            <div className="space-y-3 min-h-[100px] flex flex-col justify-center items-center bg-background rounded-lg border border-dashed border-gray-200 text-gray-400 text-sm">
                                <p>No active items</p>
                                <button className="text-blue-600 font-medium hover:underline flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Add Item
                                </button>
                            </div>
                        </div>
                    );
                })}

                {/* Always show Communication Widget */}
                <div className="lg:col-span-1 glass-card p-6 rounded-xl border border-gray-200 bg-background/50">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        Stage Comments
                    </h3>
                    <div className="space-y-4">
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-sm">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-gray-900">Rajesh K.</span>
                                <span className="text-xs text-gray-400">2h ago</span>
                            </div>
                            <p className="text-gray-600">Waiting for client approval on the initial draft.</p>
                        </div>
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
