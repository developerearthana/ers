"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateTask, deleteTask as deleteTaskAction } from "@/app/actions/activity/tasks";
import { getProjects } from "@/app/actions/projects";
import { getTeams } from "@/app/actions/organization";
import { uploadFile } from "@/app/actions/activity/documents";
import { toast } from "sonner";
import {
    Plus, Trash2, Link as LinkIcon, CheckSquare, Square, X,
    Calendar as CalendarIcon, Clock, Briefcase, Flag,
    Layout, Users, AlignLeft, Activity
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TaskDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: any;
    onUpdate: () => void;
}

export default function TaskDetailModal({ isOpen, onClose, task, onUpdate }: TaskDetailModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [checklist, setChecklist] = useState<{ text: string; completed: boolean }[]>([]);
    const [attachments, setAttachments] = useState<string[]>([]);
    const [status, setStatus] = useState("To Do");
    const [priority, setPriority] = useState("Medium");
    const [dueDate, setDueDate] = useState<string>("");
    const [projectId, setProjectId] = useState<string>("");
    const [teamId, setTeamId] = useState<string>("");
    const [remarks, setRemarks] = useState("");

    const [newChecklistItem, setNewChecklistItem] = useState("");
    const [newAttachment, setNewAttachment] = useState("");

    // Data sources
    const [projects, setProjects] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);

    const [isUploading, setIsUploading] = useState(false);

    // Load lists
    useEffect(() => {
        const loadData = async () => {
            const [projectsRes, teamsRes] = await Promise.all([
                getProjects(),
                getTeams()
            ]);

            if (projectsRes.success) {
                // Deduplicate projects by _id
                const uniqueProjects = Array.from(new Map(projectsRes.data.map((p: any) => [p._id, p])).values());
                setProjects(uniqueProjects);
            }
            if (teamsRes) {
                // Deduplicate teams by _id
                const uniqueTeams = Array.from(new Map(teamsRes.map((t: any) => [t._id, t])).values());
                setTeams(uniqueTeams);
            }
        };
        loadData();
    }, []);

    // Sync state with task, but only when task changes to a new one
    useEffect(() => {
        if (task) {
            setTitle(task.title || "");
            setDescription(task.description || "");
            setChecklist(task.checklist || []);
            setAttachments(task.attachments || []);
            setStatus(task.status || "To Do");
            setPriority(task.priority || "Medium");
            // format date for input type="date"
            setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "");
            setProjectId(task.project || "");
            setTeamId(task.teamId || "");
            setRemarks(task.remarks || "");
        }
    }, [task]);

    // Use a ref to access current state in the close handler without dependency issues
    const stateRef = useRef({
        title, description, checklist, attachments, status, priority, dueDate, projectId, teamId, remarks
    });

    useEffect(() => {
        stateRef.current = {
            title, description, checklist, attachments, status, priority, dueDate, projectId, teamId, remarks
        };
    }, [title, description, checklist, attachments, status, priority, dueDate, projectId, teamId, remarks]);

    const handleSave = async () => {
        if (!task) return;

        const current = stateRef.current;

        try {
            const res = await updateTask(task._id, {
                title: current.title,
                description: current.description,
                checklist: current.checklist,
                attachments: current.attachments,
                status: current.status as any,
                priority: current.priority as any,
                dueDate: current.dueDate ? new Date(current.dueDate) : undefined,
                project: current.projectId || undefined,
                teamId: current.teamId || undefined,
                remarks: current.remarks
            });

            if (res.success) {
                toast.success("All changes saved");
                onUpdate();
            } else {
                toast.error("Failed to save changes: " + res.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error saving task");
        }
    };

    const handleClose = async () => {
        // Auto-save on close
        await handleSave();
        onClose();
    };



    const handleDelete = async () => {
        if (!confirm("Delete this task permanently?")) return;
        try {
            const res = await deleteTaskAction(task._id);
            if (res.success) {
                toast.success("Task deleted");
                onUpdate();
                onClose();
            } else {
                toast.error("Failed to delete task");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    // Helper functions
    const addChecklist = () => {
        if (!newChecklistItem.trim()) return;
        setChecklist([...checklist, { text: newChecklistItem, completed: false }]);
        setNewChecklistItem("");
    };

    const toggleChecklist = (index: number) => {
        const newChecklist = [...checklist];
        newChecklist[index].completed = !newChecklist[index].completed;
        setChecklist(newChecklist);
    };

    const removeChecklist = (index: number) => {
        setChecklist(checklist.filter((_, i) => i !== index));
    };

    const addAttachment = () => {
        if (!newAttachment.trim()) return;
        setAttachments([...attachments, newAttachment]);
        setNewAttachment("");
    };

    const removeAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await uploadFile(formData);
            if (res.success) {
                setAttachments(prev => [...prev, res.data.url]);
                toast.success("File uploaded");
            } else {
                toast.error("Upload failed");
            }
        } catch (error) {
            toast.error("Upload failed");
        }
        setIsUploading(false);
    };

    if (!task) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
            <DialogContent
                className="max-w-5xl h-[85vh] p-0 gap-0 bg-[#F4F5F7] overflow-hidden flex flex-col"
            >
                {/* Header (Title Bar) */}
                <div className="p-6 pb-2 flex justify-between items-start bg-white border-b sticky top-0 z-10">
                    <div className="flex-1 flex gap-4 items-start">
                        <Layout className="w-6 h-6 mt-1 text-gray-600" />
                        <div className="flex-1">
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-xl font-bold border-none shadow-none focus-visible:ring-0 p-0 h-auto bg-transparent"
                                placeholder="Task Title"
                            />
                            <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                <span>in list</span>
                                <span className="underline decoration-dotted">{status}</span>
                                {projectId && (
                                    <>
                                        <span>•</span>
                                        <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs">
                                            {projects.find(p => p._id === projectId)?.name || "Unknown Project"}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-hidden">
                    <div className="h-full flex flex-col md:flex-row">
                        {/* Main Content (Left Column) */}
                        <div className="flex-1 overflow-y-auto p-6 md:pr-4 custom-scrollbar">
                            <div className="space-y-8">
                                {/* Description */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <AlignLeft className="w-6 h-6 text-gray-600" />
                                        <h3 className="text-lg font-semibold text-gray-700">Description</h3>
                                    </div>
                                    <div className="pl-10">
                                        <Textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Add a more detailed description..."
                                            className="min-h-[120px] bg-white resize-y"
                                        />
                                    </div>
                                </div>

                                {/* Checklist */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <CheckSquare className="w-6 h-6 text-gray-600" />
                                        <div className="flex justify-between items-center flex-1">
                                            <h3 className="text-lg font-semibold text-gray-700">Checklist</h3>
                                            {checklist.length > 0 && (
                                                <span className="text-xs text-gray-500">
                                                    {Math.round((checklist.filter(c => c.completed).length / checklist.length) * 100)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="pl-10 space-y-3">
                                        {/* Progress Bar */}
                                        {checklist.length > 0 && (
                                            <div className="mb-4">
                                                <Progress value={(checklist.filter(c => c.completed).length / checklist.length) * 100} className="h-1.5" />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            {checklist.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3 group">
                                                    <div className="flex items-center h-6">
                                                        <input
                                                            type="checkbox"
                                                            aria-label="Mark item as completed"
                                                            checked={item.completed}
                                                            onChange={() => toggleChecklist(idx)}
                                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                        />
                                                    </div>
                                                    <Input
                                                        value={item.text}
                                                        onChange={(e) => {
                                                            const newItem = [...checklist];
                                                            newItem[idx].text = e.target.value;
                                                            setChecklist(newItem);
                                                        }}
                                                        className={cn(
                                                            "flex-1 border-transparent hover:border-gray-200 focus:border-primary px-2 transition-all h-9",
                                                            item.completed && "line-through text-gray-500"
                                                        )}
                                                    />
                                                    <button onClick={() => removeChecklist(idx)} aria-label="Remove checklist item" className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    value={newChecklistItem}
                                                    onChange={(e) => setNewChecklistItem(e.target.value)}
                                                    placeholder="Add an item"
                                                    className="bg-white h-9"
                                                    onKeyDown={(e) => e.key === 'Enter' && addChecklist()}
                                                />
                                                <Button size="sm" onClick={addChecklist} variant="secondary">Add</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Attachments */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <LinkIcon className="w-6 h-6 text-gray-600" />
                                        <h3 className="text-lg font-semibold text-gray-700">Attachments</h3>
                                    </div>
                                    <div className="pl-10 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {attachments.map((att, idx) => (
                                                <div key={idx} className="flex gap-3 bg-white p-3 rounded-lg border hover:bg-background group">
                                                    <div className="w-16 h-12 bg-white rounded flex items-center justify-center text-gray-500 font-bold text-xs uppercase">
                                                        {att.split('.').pop()?.slice(0, 3) || 'FILE'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <a href={att} target="_blank" rel="noopener noreferrer" className="block text-sm font-medium text-gray-700 hover:underline truncate">
                                                            {att.split('/').pop()}
                                                        </a>
                                                        <div className="text-xs text-gray-500 mt-1">From Upload</div>
                                                    </div>
                                                    <button onClick={() => removeAttachment(idx)} aria-label="Remove attachment" className="opacity-0 group-hover:opacity-100 self-start text-gray-400 hover:text-red-500">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-2">
                                            <Input
                                                value={newAttachment}
                                                onChange={(e) => setNewAttachment(e.target.value)}
                                                placeholder="Paste a link..."
                                                className="bg-white h-9"
                                                onKeyDown={(e) => e.key === 'Enter' && addAttachment()}
                                            />
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id="modal-file-upload"
                                                    className="hidden"
                                                    onChange={handleFileUpload}
                                                />
                                                <Button asChild variant="secondary" disabled={isUploading} className="whitespace-nowrap">
                                                    <label htmlFor="modal-file-upload" className="cursor-pointer">
                                                        {isUploading ? "Uploading..." : "Upload File"}
                                                    </label>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Remarks / Activity */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <Activity className="w-6 h-6 text-gray-600" />
                                        <h3 className="text-lg font-semibold text-gray-700">Remarks</h3>
                                    </div>
                                    <div className="pl-10">
                                        <Textarea
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            placeholder="Add remarks or notes..."
                                            className="min-h-[80px] bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar (Right Column) */}
                        <div className="w-full md:w-64 bg-background border-l border-gray-200 p-4 space-y-6 overflow-y-auto">

                            {/* Properties Section */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="To Do">To Do</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="In Review">In Review</SelectItem>
                                        <SelectItem value="Done">Done</SelectItem>
                                        <SelectItem value="Archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</Label>
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Project</Label>
                                <Select value={projectId} onValueChange={(v) => setProjectId(v === "none" ? "" : v)}>
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue placeholder="Select Project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Project</SelectItem>
                                        {projects.map(p => (
                                            <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Due Date</Label>
                                <Input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Team</Label>
                                <Select value={teamId} onValueChange={(v) => setTeamId(v === "none" ? "" : v)}>
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue placeholder="Select Team" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Team</SelectItem>
                                        {teams.map(t => (
                                            <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <hr className="border-gray-200" />

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</Label>
                                <Button variant="secondary" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleDelete}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete Task
                                </Button>
                            </div>

                            <div className="pt-4 text-xs text-gray-400 text-center">
                                Task ID: {task._id.slice(-6)}
                                <br />
                                Auto-save enabled
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

