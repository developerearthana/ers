"use client";

import { useEffect, useState } from "react";
import { Calendar, CheckSquare, MessageSquare, TrendingUp, Clock, AlertCircle, FileText, Paperclip, ListChecks } from "lucide-react";
import { getEvents } from "@/app/actions/activity/calendar";
import { getTasks } from "@/app/actions/activity/tasks";
import { getConversations } from "@/app/actions/activity/chat";
import { getContents } from "@/app/actions/activity/documents";
import { startOfWeek, endOfWeek, addWeeks } from "date-fns";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ActivityPage() {
    const [stats, setStats] = useState({
        events: 0,
        completedTasks: 0,
        unreadMessages: 0,
        documents: 0
    });
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const [myTasks, setMyTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const now = new Date();
            const weekStart = startOfWeek(now);
            const weekEnd = endOfWeek(now);

            try {
                const [eventsRes, tasksRes, chatsRes, docsRes] = await Promise.all([
                    getEvents(now, addWeeks(now, 1)), // Next 1 week
                    getTasks(),
                    getConversations(),
                    getContents() // All root docs
                ]);

                const events = eventsRes.success ? eventsRes.data : [];
                const tasks = tasksRes.success ? tasksRes.data : [];
                const chats = chatsRes.success ? chatsRes.data : [];
                const docs = docsRes.success && docsRes.data ? docsRes.data.documents : [];

                setStats({
                    events: events.length,
                    completedTasks: tasks.filter((t: any) => t.status === 'Done').length,
                    unreadMessages: 0, // Placeholder as backend support pending
                    documents: docs.length + (docsRes.success && docsRes.data ? docsRes.data.folders.length : 0)
                });

                setUpcomingEvents(events.slice(0, 5));
                setMyTasks(tasks.filter((t: any) => t.status !== 'Done').slice(0, 5));

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-primary">Activity Overview</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/activity/calendar">
                    <div className="glass-card p-5 rounded-xl border border-border flex flex-col justify-between h-32 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Upcoming Events</p>
                                <h3 className="text-2xl font-bold text-primary mt-1">{stats.events}</h3>
                            </div>
                            <div className="p-2 bg-muted rounded-lg text-primary">
                                <Calendar className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground relative z-10">In the next 7 days</p>
                    </div>
                </Link>

                <Link href="/activity/todo">
                    <div className="glass-card p-5 rounded-xl border border-border flex flex-col justify-between h-32 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-green-100/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Completed Tasks</p>
                                <h3 className="text-2xl font-bold text-primary mt-1">{stats.completedTasks}</h3>
                            </div>
                            <div className="p-2 bg-muted rounded-lg text-secondary-foreground">
                                <CheckSquare className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-xs text-primary flex items-center gap-1 relative z-10">
                            <TrendingUp className="w-3 h-3" />
                            Great job!
                        </p>
                    </div>
                </Link>

                <Link href="/activity/chat">
                    <div className="glass-card p-5 rounded-xl border border-border flex flex-col justify-between h-32 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-purple-100/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Messages</p>
                                <h3 className="text-2xl font-bold text-foreground mt-1">Inbox</h3>
                            </div>
                            <div className="p-2 bg-muted rounded-lg text-primary">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground relative z-10">Check your conversations</p>
                    </div>
                </Link>

                <Link href="/activity/documents">
                    <div className="glass-card p-5 rounded-xl border border-border flex flex-col justify-between h-32 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Files & Folders</p>
                                <h3 className="text-2xl font-bold text-foreground mt-1">{stats.documents}</h3>
                            </div>
                            <div className="p-2 bg-muted rounded-lg text-primary">
                                <FileText className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground relative z-10">Total in root</p>
                    </div>
                </Link>
            </div>

            {/* Dashboard Widgets Area */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-2 glass-card rounded-xl p-6 min-h-[300px] border border-border">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-muted rounded-lg"><Calendar className="w-5 h-5 text-primary" /></div>
                            <h3 className="text-lg font-bold text-primary">Upcoming Schedule</h3>
                        </div>
                        <Link href="/activity/calendar" className="text-sm text-primary hover:underline font-medium">View Calendar</Link>
                    </div>
                    {upcomingEvents.length > 0 ? (
                        <div className="space-y-3">
                            {upcomingEvents.map((evt: any) => (
                                <div key={evt._id || evt.id} className="flex items-center gap-4 p-3 rounded-lg bg-card/50 border border-border hover:bg-card hover:shadow-sm transition-all">
                                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-card rounded-xl shadow-sm border border-border font-bold text-foreground shrink-0">
                                        <span className="text-[10px] uppercase text-red-500 font-bold">{new Date(evt.start).toLocaleDateString([], { month: 'short' })}</span>
                                        <span className="text-xl leading-none">{new Date(evt.start).getDate()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-foreground truncate">{evt.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                            <Clock className="w-3 h-3" />
                                            <span>
                                                {new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                {new Date(evt.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={cn("px-2.5 py-1 text-xs rounded-full font-medium shrink-0",
                                        evt.type === 'Meeting' ? "bg-primary/10 text-primary" :
                                            evt.type === 'Task' ? "bg-primary/20 text-foreground" : "bg-muted text-foreground")}>
                                        {evt.type}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 bg-background/30 rounded-lg border border-dashed border-gray-200 text-muted-foreground text-sm">
                            <Calendar className="w-8 h-8 mb-2 opacity-50" />
                            No upcoming events
                        </div>
                    )}
                </div>

                <div className="glass-card rounded-xl p-6 min-h-[300px] border border-border">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-muted rounded-lg"><CheckSquare className="w-5 h-5 text-secondary-foreground" /></div>
                            <h3 className="text-lg font-bold text-primary">My Tasks</h3>
                        </div>
                        <Link href="/activity/todo" className="text-sm text-primary hover:underline font-medium">View All</Link>
                    </div>
                    {myTasks.length > 0 ? (
                        <div className="space-y-3">
                            {myTasks.map((task: any) => (
                                <div key={task._id} className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border hover:bg-card hover:shadow-sm transition-all group">
                                    <div className={cn("w-1 h-8 rounded-full self-center shrink-0",
                                        task.priority === 'High' ? "bg-red-500" : task.priority === 'Medium' ? "bg-yellow-500" : "bg-primary")}></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{task.title}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                            {task.dueDate && <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        {task.attachments?.length > 0 && <Paperclip className="w-3 h-3 text-muted-foreground" />}
                                        {task.checklist?.length > 0 && <ListChecks className="w-3 h-3 text-muted-foreground" />}
                                    </div>
                                    <span className="text-[10px] px-1.5 py-0.5 bg-card border border-border rounded text-primary shrink-0 whitespace-nowrap shadow-sm">{task.status}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 bg-background/30 rounded-lg border border-dashed border-gray-200 text-muted-foreground text-sm">
                            <CheckSquare className="w-8 h-8 mb-2 opacity-50" />
                            No pending tasks
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

