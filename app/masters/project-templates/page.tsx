"use client";

import { useState, useRef } from 'react';
import { Plus, Trash2, ArrowLeft, Layers, GripVertical, Save } from 'lucide-react';
import Link from 'next/link';
import { MOCK_PROJECT_TEMPLATES } from '@/lib/mock-data';

export default function ProjectTemplatesMaster() {
    const [templates, setTemplates] = useState(MOCK_PROJECT_TEMPLATES);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [newStageName, setNewStageName] = useState("");
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const dragIndex = useRef<number | null>(null);

    const handleEdit = (template: any) => {
        setEditingTemplate({ ...template });
    };

    const handleSave = () => {
        setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
        setEditingTemplate(null);
    };

    const addStage = () => {
        if (!newStageName) return;
        setEditingTemplate({
            ...editingTemplate,
            stages: [...editingTemplate.stages, { id: `s-${Date.now()}`, name: newStageName, modules: [] }]
        });
        setNewStageName("");
    };

    const removeStage = (stageId: string) => {
        setEditingTemplate({
            ...editingTemplate,
            stages: editingTemplate.stages.filter((s: any) => s.id !== stageId)
        });
    };

    // ─── Drag and Drop handlers ───
    const onDragStart = (index: number) => {
        dragIndex.current = index;
    };

    const onDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const onDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (dragIndex.current === null || dragIndex.current === dropIndex) {
            setDragOverIndex(null);
            return;
        }
        const stages = [...editingTemplate.stages];
        const [moved] = stages.splice(dragIndex.current, 1);
        stages.splice(dropIndex, 0, moved);
        setEditingTemplate({ ...editingTemplate, stages });
        dragIndex.current = null;
        setDragOverIndex(null);
    };

    const onDragEnd = () => {
        dragIndex.current = null;
        setDragOverIndex(null);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Link href="/masters" className="p-2 hover:bg-white rounded-full transition-colors text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Project Templates</h1>
                    <p className="text-gray-500">Define standard phase workflows for different project types.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Template List */}
                <div className="lg:col-span-1 space-y-4">
                    {templates.map(template => (
                        <div
                            key={template.id}
                            onClick={() => handleEdit(template)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${editingTemplate?.id === template.id
                                    ? 'bg-white border-blue-200 ring-1 ring-blue-300'
                                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="p-2 bg-white rounded-lg border border-gray-100">
                                    <Layers className="w-5 h-5 text-blue-600" />
                                </div>
                                {editingTemplate?.id === template.id && <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">Editing</span>}
                            </div>
                            <h3 className="font-semibold text-gray-900">{template.name}</h3>
                            <p className="text-sm text-gray-500 mt-1 lines-clamp-2">{template.description}</p>
                            <div className="mt-3 text-xs font-medium text-gray-400">
                                {template.stages.length} Stages Defined
                            </div>
                        </div>
                    ))}
                    <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors flex items-center justify-center gap-2 font-medium">
                        <Plus className="w-5 h-5" />
                        Create New Template
                    </button>
                </div>

                {/* Editor Section */}
                <div className="lg:col-span-2">
                    {editingTemplate ? (
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-background/50">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Editing: {editingTemplate.name}</h2>
                                    <p className="text-sm text-gray-500">Manage stages and sequence</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingTemplate(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white rounded-lg">Cancel</button>
                                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-2">
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Stages List */}
                                <div className="space-y-2">
                                    {editingTemplate.stages.map((stage: any, index: number) => (
                                        <div
                                            key={stage.id}
                                            draggable
                                            onDragStart={() => onDragStart(index)}
                                            onDragOver={(e) => onDragOver(e, index)}
                                            onDrop={(e) => onDrop(e, index)}
                                            onDragEnd={onDragEnd}
                                            className={`group relative flex items-center gap-4 p-3 bg-white border rounded-lg transition-all select-none
                                                ${dragOverIndex === index
                                                    ? 'border-blue-400 bg-blue-50 shadow-md scale-[1.01]'
                                                    : 'border-gray-200 hover:border-blue-200'
                                                }
                                                ${dragIndex.current === index ? 'opacity-40' : 'opacity-100'}
                                            `}
                                        >
                                            <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none">
                                                <GripVertical className="w-5 h-5" />
                                            </div>
                                            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900">{stage.name}</h4>
                                                {stage.modules.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                        {stage.modules.map((mod: string) => (
                                                            <span key={mod} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded border border-gray-200">
                                                                {mod}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => removeStage(stage.id)}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                aria-label={`Remove ${stage.name}`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Stage */}
                                <div className="flex gap-2 pt-4 border-t border-gray-100">
                                    <input
                                        type="text"
                                        placeholder="New Stage Name (e.g. Quality Check)"
                                        className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        value={newStageName}
                                        onChange={(e) => setNewStageName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addStage()}
                                    />
                                    <button
                                        onClick={addStage}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Stage
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl bg-background/50">
                            <Layers className="w-12 h-12 mb-4 opacity-20" />
                            <p>Select a template to configure its stages and modules.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
