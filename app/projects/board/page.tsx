"use client";

import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Loader2 } from 'lucide-react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getProjects, updateProject } from '@/app/actions/project'; // Make sure updateProject acts on Project model
import { toast } from 'sonner';
import { PageWrapper } from '@/components/ui/page-wrapper';

type StatusId = 'Planning' | 'In Progress' | 'On Hold' | 'Completed';

interface Project {
    id: string;
    _id?: string; // Handle both id styles if needed
    name: string;
    client: string;
    status: string;
    priority?: string;
    template?: string;
}

const columns: { id: StatusId; title: string; color: string; headerColor: string }[] = [
    { id: 'Planning', title: 'Planning', color: 'bg-background/50 border-gray-200', headerColor: 'bg-white/80 text-gray-700 border-gray-200' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-white/50 border-blue-200', headerColor: 'bg-blue-100/80 text-blue-700 border-blue-200' },
    { id: 'On Hold', title: 'On Hold', color: 'bg-white/50 border-orange-200', headerColor: 'bg-orange-100/80 text-orange-700 border-orange-200' },
    { id: 'Completed', title: 'Completed', color: 'bg-emerald-50/50 border-emerald-200', headerColor: 'bg-emerald-100/80 text-emerald-700 border-emerald-200' },
];

function SortableProjectCard({ project }: { project: Project }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: project.id, data: { ...project } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            {...{ style }}
            {...attributes}
            {...listeners}
            className={cn(
                "bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative group",
                isDragging ? "opacity-50 z-50 ring-2 ring-primary rotate-2" : "opacity-100 border-gray-100"
            )}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground line-clamp-1">{project.client}</span>
                <button aria-label="More options" className="text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-3 line-clamp-2">{project.name}</h4>

            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded font-bold",
                    project.priority === 'High' ? "bg-red-50 text-red-600" :
                        project.priority === 'Medium' ? "bg-white text-orange-600" :
                            "bg-background text-gray-500"
                )}>
                    {project.priority || 'Normal'}
                </span>
            </div>
        </div>
    );
}

export default function ProjectBoardPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const res = await getProjects({});
            if (res.success && res.data) {
                // Ensure IDs are consistent strings
                const mapped = res.data.map((p: any) => ({ ...p, id: p.id || p._id }));
                setProjects(mapped);
            }
        } catch (error) {
            toast.error("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeProject = projects.find(p => p.id === activeId);
        if (!activeProject) return;

        // Determine new status
        let newStatus = activeProject.status;

        // If dropped on a column container
        if (columns.some(c => c.id === overId)) {
            newStatus = overId;
        } else {
            // If dropped on another item, take that item's status
            const overProject = projects.find(p => p.id === overId);
            if (overProject) {
                newStatus = overProject.status;
            }
        }

        if (activeProject.status !== newStatus) {
            // Optimistic Update
            const updatedProjects = projects.map(p =>
                p.id === activeId ? { ...p, status: newStatus } : p
            );
            setProjects(updatedProjects);

            try {
                const res = await updateProject(activeId, { status: newStatus });
                if (!res.success) {
                    throw new Error(res.error);
                }
                toast.success(`Project moved to ${newStatus}`);
            } catch (error) {
                toast.error("Failed to update status");
                // Revert
                setProjects(projects);
            }
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
        <PageWrapper className="h-full flex flex-col gap-6 p-4 max-w-[1920px] mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Project Board</h1>
                    <p className="text-muted-foreground mt-1">Visualize project workflow.</p>
                </div>
                {/* <Button>
                    <Plus className="w-4 h-4 mr-2" /> Add Project
                </Button> */}
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex gap-6 h-full min-w-[1024px]">
                        {columns.map((col) => {
                            const colProjects = projects.filter(p => p.status === col.id);

                            return (
                                <div key={col.id} className="flex-1 flex flex-col min-w-[280px] h-full">
                                    <div className={cn("p-3 rounded-t-xl border-t border-l border-r border-b-0 shadow-sm flex justify-between items-center mb-0 z-10", col.headerColor)}>
                                        <h3 className="font-bold text-sm">{col.title}</h3>
                                        <span className="text-xs bg-white/60 px-2 py-0.5 rounded-full font-bold shadow-sm">{colProjects.length}</span>
                                    </div>

                                    <div className={cn("flex-1 rounded-b-xl border border-t-0 p-3 space-y-3 overflow-y-auto", col.color)}>
                                        <SortableContext id={col.id} items={colProjects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                                            {colProjects.map(project => (
                                                <SortableProjectCard key={project.id} project={project} />
                                            ))}
                                        </SortableContext>
                                        <Button variant="ghost" className="w-full border-2 border-dashed border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300">
                                            <Plus className="w-4 h-4 mr-2" /> Add Project
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className="bg-white p-4 rounded-xl border border-primary/50 shadow-2xl rotate-2 cursor-grabbing w-[280px]">
                            {(() => {
                                const p = projects.find(p => p.id === activeId);
                                return p ? (
                                    <>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground line-clamp-1">{p.client}</span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-sm mb-3">{p.name}</h4>
                                    </>
                                ) : null;
                            })()}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </PageWrapper>
    );
}
