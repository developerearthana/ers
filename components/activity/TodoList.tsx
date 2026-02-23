"use client";

import { useState, useEffect } from 'react';
import { Plus, CheckCircle, Circle, Trash2, Calendar as CalendarIcon, LayoutList, Kanban, Clock, Flag, User, Loader2, Paperclip, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createTask, getTasks, updateTaskStatus, updateTask, deleteTask as deleteTaskAction } from '@/app/actions/activity/tasks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TaskDetailModal from './TaskDetailModal';

type ViewMode = 'list' | 'board';
type Priority = 'High' | 'Medium' | 'Low';
type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'Archived';
type SortMode = 'newest' | 'priority' | 'oldest';

interface Task {
    _id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: Priority;
    dueDate?: string;
    assignees: string[];
    checklist?: { text: string; completed: boolean }[];
    attachments?: string[];
    project?: string;
    teamId?: string;
    remarks?: string;
}

export default function TodoList() {
    const [viewMode, setViewMode] = useState<ViewMode>('board');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewArchived, setViewArchived] = useState(false);
    const [sortMode, setSortMode] = useState<SortMode>('newest');
    const [newTask, setNewTask] = useState('');
    const [newPriority, setNewPriority] = useState<Priority>('Medium');
    const [newRemarks, setNewRemarks] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchTasks = async () => {
        setLoading(true);
        const res = await getTasks();
        if (res.success) {
            setTasks(res.data as Task[]);
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const toggleStatus = async (task: Task) => {
        // Optimistic update
        const newStatus: TaskStatus = task.status === 'Done' ? 'To Do' : 'Done';
        const updatedTasks = tasks.map(t => t._id === task._id ? { ...t, status: newStatus } : t);
        setTasks(updatedTasks as Task[]);

        try {
            const res = await updateTaskStatus(task._id, newStatus);
            if (!res.success) throw new Error(res.error);
            toast.success("Task status updated");
        } catch (error: any) {
            toast.error("Failed to update status");
            fetchTasks(); // Revert
        }
    };

    const cyclePriority = async (task: Task) => {
        const priorities: Priority[] = ['Low', 'Medium', 'High'];
        const currentIdx = priorities.indexOf(task.priority);
        const nextPriority = priorities[(currentIdx + 1) % 3];

        // Optimistic
        const updatedTasks = tasks.map(t => t._id === task._id ? { ...t, priority: nextPriority } : t);
        setTasks(updatedTasks);

        try {
            const res = await updateTask(task._id, { priority: nextPriority });
            if (!res.success) throw new Error(res.error);
            toast.success(`Priority set to ${nextPriority}`);
        } catch (error) {
            toast.error("Failed to update priority");
            fetchTasks();
        }
    };

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        try {
            const res = await createTask({
                title: newTask,
                status: 'To Do',
                priority: newPriority,
                remarks: newRemarks
            });

            if (res.success) {
                setTasks([res.data, ...tasks]);
                setNewTask('');
                setNewPriority('Medium');
                setNewRemarks('');
                setIsAdding(false);
                toast.success("New task created");
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Network error");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this task?")) return;
        setTasks(tasks.filter(t => t._id !== id)); // Optimistic

        const res = await deleteTaskAction(id);
        if (!res.success) {
            toast.error("Failed to delete");
            fetchTasks();
        } else {
            toast.success("Task deleted");
        }
    };

    const statusMap: Record<string, string> = {
        'To Do': 'Pending',
        'In Progress': 'In Progress',
        'In Review': 'Review',
        'Done': 'Resolved'
    };

    const priorityColor = (p: Priority) => {
        switch (p) {
            case 'High': return 'text-red-600 bg-red-100 border-red-200';
            case 'Medium': return 'text-amber-600 bg-amber-100 border-amber-200';
            case 'Low': return 'text-emerald-600 bg-emerald-100 border-emerald-200';
            default: return 'text-gray-600 bg-white';
        }
    };

    const TaskCard = ({ task, isBoard = false }: { task: Task, isBoard?: boolean }) => (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
                "group relative bg-white border border-gray-100 hover:border-primary/30 transition-all rounded-xl shadow-sm hover:shadow-md",
                isBoard ? "p-4 flex flex-col gap-3 h-auto" : "p-3 flex items-start gap-4"
            )}
        >
            <button
                onClick={() => toggleStatus(task)}
                className={cn(
                    "flex-shrink-0 transition-colors",
                    task.status === 'Done' ? "text-primary" : "text-gray-300 hover:text-primary"
                )}
            >
                {task.status === 'Done' ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
            </button>

            <div className={cn("flex-1 min-w-0", isBoard && "order-last")}>
                <p className={cn("font-medium text-gray-800", isBoard ? "text-sm mb-2" : "text-sm", task.status === 'Done' && "text-gray-400 line-through")}>
                    {task.title}
                </p>
                {task.description && (
                    <p className="text-xs text-gray-500 mb-2 whitespace-pre-wrap">{task.description}</p>
                )}
                <div className={cn("flex flex-wrap items-center gap-2", !isBoard && "mt-1")}>
                    {/* Badges for Trello-like feel */}
                    {(task.checklist?.length || 0) > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-white px-1.5 py-0.5 rounded">
                            <ListChecks className="w-3 h-3" />
                            <span>{task.checklist!.filter(i => i.completed).length}/{task.checklist!.length}</span>
                        </div>
                    )}
                    {(task.attachments?.length || 0) > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-white px-1.5 py-0.5 rounded">
                            <Paperclip className="w-3 h-3" />
                            <span>{task.attachments!.length}</span>
                        </div>
                    )}

                    {isBoard && task.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mr-auto">
                            <Clock className="w-3 h-3" /> {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                    )}
                    <span
                        onClick={() => cyclePriority(task)}
                        title="Click to cycle priority"
                        className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold border cursor-pointer hover:brightness-95 select-none transition-transform active:scale-95", priorityColor(task.priority))}
                    >
                        {task.priority}
                    </span>
                    {/* Assignee avatars for Trello feel */}
                    {task.assignees && task.assignees.length > 0 && (
                        <div className="flex -space-x-2 ml-auto">
                            {task.assignees.slice(0, 3).map((a, i) => (
                                <div key={i} className="w-5 h-5 rounded-full bg-blue-100 border border-white flex items-center justify-center text-[8px] text-blue-700 font-bold overflow-hidden">
                                    <User className="w-3 h-3" />
                                </div>
                            ))}
                            {task.assignees.length > 3 && (
                                <div className="w-5 h-5 rounded-full bg-white border border-white flex items-center justify-center text-[8px] text-gray-600 font-bold">
                                    +{task.assignees.length - 3}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Button variant="ghost" size="icon" title="Delete Task" className={cn("h-8 w-8 text-gray-400 hover:text-red-500 transition-opacity", isBoard ? "absolute top-2 right-2 opacity-0 group-hover:opacity-100" : "ml-auto opacity-0 group-hover:opacity-100")} onClick={() => handleDelete(task._id)}>
                <Trash2 className="w-4 h-4" />
            </Button>
            {task.status === 'Done' && !viewArchived && (
                <Button variant="ghost" size="icon" title="Archive Task" className="h-8 w-8 text-gray-400 hover:text-amber-500 transition-opacity ml-1 opacity-0 group-hover:opacity-100" onClick={async () => {
                    try {
                        await updateTaskStatus(task._id, 'Archived');
                        toast.success('Task Archived');
                        fetchTasks();
                    } catch (e) { toast.error('Failed to archive'); }
                }}>
                    <LayoutList className="w-4 h-4" />
                </Button>
            )}
        </motion.div>
    );

    const stats = {
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        pending: tasks.filter(t => t.status === 'To Do').length
    };



    const getSortedTasks = (tasksToDisplay: Task[]) => {
        return [...tasksToDisplay].sort((a, b) => {
            if (sortMode === 'priority') {
                const pMap = { High: 3, Medium: 2, Low: 1 };
                return pMap[b.priority] - pMap[a.priority];
            }
            if (sortMode === 'oldest') {
                return a._id.localeCompare(b._id); // Approximate creation time
            }
            // default newest
            return b._id.localeCompare(a._id);
        });
    };

    const displayedTasks = getSortedTasks(tasks.filter(t => viewArchived ? t.status === 'Archived' : t.status !== 'Archived'));

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{viewArchived ? 'Archived Tasks' : 'Task Board'}</h2>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        {!viewArchived && (
                            <>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white0" /> {stats.inProgress} In Progress</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> {stats.pending} To Do</span>
                            </>
                        )}
                        <button onClick={() => setViewArchived(!viewArchived)} className="text-primary hover:underline text-xs ml-4">
                            {viewArchived ? 'Back to Active Tasks' : 'View Archived Tasks'}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white/50 p-1 rounded-lg">
                    <Select value={sortMode} onValueChange={(v: SortMode) => setSortMode(v)}>
                        <SelectTrigger className="w-[120px] h-9 bg-white border-0 shadow-sm">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="oldest">Oldest</SelectItem>
                            <SelectItem value="priority">Priority</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="w-[1px] h-6 bg-white mx-1" />
                    <button onClick={() => setViewMode('list')} title="List View" className={cn("p-2 rounded-md transition-colors", viewMode === 'list' && "bg-white shadow-sm text-primary")}><LayoutList className="w-4 h-4" /></button>
                    <button onClick={() => setViewMode('board')} title="Board View" className={cn("p-2 rounded-md transition-colors", viewMode === 'board' && "bg-white shadow-sm text-primary")}><Kanban className="w-4 h-4" /></button>
                    <div className="w-[1px] h-6 bg-white mx-1" />
                    <Button onClick={() => setIsAdding(true)} size="sm" className="h-8 gap-2"><Plus className="w-4 h-4" /> Add Task</Button>
                </div>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={addTask}
                        className="glass-card p-4 rounded-xl flex items-center gap-3 overflow-hidden"
                    >
                        <input autoFocus type="text" placeholder="What needs to be done?" className="flex-1 bg-transparent border-none text-lg focus:ring-0" value={newTask} onChange={(e) => setNewTask(e.target.value)} />

                        <Select value={newPriority} onValueChange={(v: Priority) => setNewPriority(v)}>
                            <SelectTrigger className="w-[100px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                        </Select>

                        <input
                            type="text"
                            placeholder="Remarks (Optional)"
                            className="bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-primary w-48"
                            value={newRemarks}
                            onChange={(e) => setNewRemarks(e.target.value)}
                        />

                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                            <Button type="submit">Add Task</Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* ... previous content ... */}
            <div className="flex-1 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                ) : viewMode === 'list' ? (
                    <div className="space-y-2 h-full overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence mode='popLayout'>
                            {displayedTasks.map(task =>
                                <div key={task._id} onClick={() => { setSelectedTask(task); setIsDetailOpen(true); }} className="cursor-pointer">
                                    <TaskCard task={task} />
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full overflow-y-auto pb-4 custom-scrollbar">
                        {['To Do', 'In Progress', 'In Review', 'Done'].map((status) => (
                            <div key={status} className="flex flex-col gap-3">
                                <div className="sticky top-0 bg-background/80 backdrop-blur-sm p-3 rounded-lg border border-gray-100 z-10 flex justify-between">
                                    <h3 className="font-semibold text-gray-700 text-sm">{status}</h3>
                                    <span className="bg-white text-xs font-bold px-2 py-0.5 rounded-full border">{displayedTasks.filter(t => t.status === status).length}</span>
                                </div>
                                <div className="space-y-3">
                                    <AnimatePresence mode='popLayout'>
                                        {displayedTasks.filter(t => t.status === status).map(task =>
                                            <div key={task._id} onClick={() => { setSelectedTask(task); setIsDetailOpen(true); }} className="cursor-pointer">
                                                <TaskCard key={task._id} task={task} isBoard={true} />
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <TaskDetailModal
                isOpen={isDetailOpen}
                onClose={() => { setIsDetailOpen(false); setSelectedTask(undefined); }}
                task={selectedTask}
                onUpdate={fetchTasks}
            />
        </div>
    );
}

