"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, isToday, addWeeks, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Loader2, Calendar as CalendarIcon, Clock, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getEvents } from "@/app/actions/activity/calendar";
import EventModal from "./EventModal";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function CalendarView() {
    const { data: session } = useSession();
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedEvent, setSelectedEvent] = useState<any>(undefined);
    const [alertsEnabled, setAlertsEnabled] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('earthana_dashboard_alerts');
        if (saved !== null) setAlertsEnabled(saved === 'true');
    }, []);

    const toggleAlerts = () => {
        const newVal = !alertsEnabled;
        setAlertsEnabled(newVal);
        localStorage.setItem('earthana_dashboard_alerts', String(newVal));
        if (newVal) {
            toast.success("Dashboard notifications enabled! 🔔");
        } else {
            toast.info("Dashboard notifications muted.");
        }
    };

    const fetchEvents = async () => {
        setLoading(true);
        let start, end;

        if (viewMode === 'month') {
            start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
            end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
        } else {
            start = startOfWeek(currentDate, { weekStartsOn: 1 });
            end = endOfWeek(currentDate, { weekStartsOn: 1 });
        }

        const res = await getEvents(start, end);
        if (res.success) {
            setEvents(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEvents();
    }, [currentDate, viewMode]);

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setSelectedEvent(undefined);
        setIsModalOpen(true);
    };

    const handleEventClick = (e: React.MouseEvent, event: any) => {
        e.stopPropagation();
        setSelectedEvent(event);
        setSelectedDate(undefined);
        setIsModalOpen(true);
    };

    const next = () => {
        if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
        else setCurrentDate(addWeeks(currentDate, 1));
    };

    const prev = () => {
        if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
        else setCurrentDate(addWeeks(currentDate, -1));
    };

    const today = () => setCurrentDate(new Date());

    const getCalendarDays = () => {
        if (viewMode === 'week') {
            return eachDayOfInterval({
                start: startOfWeek(currentDate, { weekStartsOn: 1 }),
                end: endOfWeek(currentDate, { weekStartsOn: 1 })
            });
        }
        const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
        const days = [];
        let day = start;
        for (let i = 0; i < 35; i++) {
            days.push(day);
            day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
        }
        return days;
    };

    const days = getCalendarDays();

    const getDayEvents = (date: Date) => {
        return events.filter(event => {
            const eventStart = new Date(event.start);
            const eventEnd = event.end ? new Date(event.end) : eventStart;
            const eventStartDay = startOfDay(eventStart);
            const eventEndDay = startOfDay(eventEnd);
            const thisDay = startOfDay(date);
            return thisDay >= eventStartDay && thisDay <= eventEndDay;
        });
    };

    const getEventColor = (type: string) => {
        switch (type) {
            case 'Meeting': return 'bg-blue-500';
            case 'Task': return 'bg-green-500';
            case 'Reminder': return 'bg-amber-500';
            case 'Holiday': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    const getEventStyle = (type: string) => {
        switch (type) {
            case 'Meeting': return 'bg-white text-blue-700 border-border';
            case 'Task': return 'bg-white text-green-700 border-border';
            case 'Reminder': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'Holiday': return 'bg-white text-purple-700 border-border';
            default: return 'bg-background text-gray-700 border-gray-100';
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] gap-6 p-2">
            <div className="flex flex-col md:flex-row items-center justify-between bg-white/50 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-sm gap-4">
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl">
                            <CalendarIcon className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold font-display text-gray-800 tracking-tight whitespace-nowrap">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                    </div>
                    <div className="flex items-center bg-white/50 rounded-lg p-1 border border-gray-200/50">
                        <Button variant="ghost" size="icon" onClick={prev} className="hover:bg-white hover:text-primary transition-all rounded-md w-8 h-8"><ChevronLeft className="h-4 w-4" /></Button>
                        <Button variant="ghost" className="px-3 md:px-4 py-1 text-sm font-medium hover:bg-white hover:text-primary transition-all rounded-md h-8" onClick={today}>Today</Button>
                        <Button variant="ghost" size="icon" onClick={next} className="hover:bg-white hover:text-primary transition-all rounded-md w-8 h-8"><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleAlerts}
                        className={cn(
                            "rounded-xl transition-all duration-300 w-10 h-10",
                            alertsEnabled ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-white text-gray-400 border-gray-100"
                        )}
                        title={alertsEnabled ? "Dashboard Alerts ON" : "Dashboard Alerts OFF"}
                    >
                        {alertsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </Button>

                    <div className="flex bg-white/80 p-1 rounded-xl border border-gray-200/50">
                        <button
                            onClick={() => setViewMode('month')}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200",
                                viewMode === 'month' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200",
                                viewMode === 'week' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Week
                        </button>
                    </div>

                    <Button onClick={() => handleDateClick(new Date())} className="ml-auto gap-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
                        <Plus className="h-4 w-4" /> <span className="hidden md:inline">New Event</span>
                    </Button>
                </div>
            </div>

            <div className="flex-1 bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-xl rounded-3xl border border-white/60 overflow-hidden flex flex-col shadow-2xl shadow-blue-900/5">
                <div className="grid grid-cols-7 border-b border-white/10 bg-white/40 backdrop-blur-md shadow-sm shrink-0">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                        <div key={day} className={cn(
                            "py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest",
                            viewMode === 'week' && isSameDay(days[i], new Date()) && "text-primary bg-primary/5 rounded-t-lg"
                        )}>
                            {day}
                            {viewMode === 'week' && (
                                <div className={cn("mt-1 text-lg", isSameDay(days[i], new Date()) && "text-primary")}>
                                    {format(days[i], 'd')}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {loading && events.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-gray-400 font-medium">Loading your schedule...</p>
                    </div>
                ) : (
                    <div className={cn(
                        "flex-1 grid grid-cols-7 p-2 bg-gradient-to-br from-white/40 to-white/10",
                        viewMode === 'month' ? "grid-rows-5 gap-1 h-full" : "grid-rows-1 h-full"
                    )}>
                        <AnimatePresence mode="popLayout">
                            {days.map((day, idx) => {
                                const dayEvents = getDayEvents(day);
                                const isCurrentMonth = isSameMonth(day, currentDate);
                                const isCurrentDay = isToday(day);
                                const isSunday = day.getDay() === 0;

                                return (
                                    <motion.div
                                        key={day.toISOString()}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.2, delay: idx * 0.005 }}
                                        className={cn(
                                            "border border-white/30 rounded-lg p-1 flex flex-col gap-1 transition-all duration-200 cursor-pointer group relative overflow-hidden hover:shadow-md bg-white/40 backdrop-blur-sm",
                                            viewMode === 'month' ? "h-full w-full" : "h-full border-b-0",
                                            !isCurrentMonth && viewMode === 'month' && "bg-white/30 text-gray-300 opacity-60",
                                            isSunday && "bg-red-50/60 border-red-100/50",
                                            isCurrentDay && "ring-2 ring-green-500/50 bg-white/80 shadow-green-100",
                                        )}
                                        onClick={() => handleDateClick(day)}
                                    >
                                        {viewMode === 'month' && (
                                            <div className="flex justify-between items-start">
                                                <span className={cn(
                                                    "text-sm font-semibold h-7 w-7 flex items-center justify-center rounded-full transition-all duration-300",
                                                    isCurrentDay
                                                        ? "bg-green-600 text-white shadow-md scale-110"
                                                        : (isSunday ? "text-red-500" : "text-gray-700"),
                                                    !isCurrentMonth && "text-gray-300"
                                                )}>
                                                    {format(day, 'd')}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar mt-1">
                                            {(isCurrentMonth || viewMode === 'week') && dayEvents.map((evt) => {
                                                const typeColor = getEventColor(evt.type || 'Meeting');
                                                const styleClass = getEventStyle(evt.type || 'Meeting');

                                                return (
                                                    <div
                                                        key={`${evt._id || evt.id}-${day.toISOString()}`}
                                                        onClick={(e) => handleEventClick(e, evt)}
                                                        className={cn(
                                                            "text-[10px] px-2 py-1.5 rounded-lg truncate font-medium border border-transparent hover:scale-[1.02] active:scale-95 transition-all shadow-sm flex items-center gap-1.5",
                                                            styleClass,
                                                            viewMode === 'week' && "py-2"
                                                        )}
                                                    >
                                                        <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", typeColor)} />
                                                        <div className="flex flex-col min-w-0 flex-1">
                                                            {isSameDay(new Date(evt.start), day) && <span className="opacity-90 leading-tight">{format(new Date(evt.start), 'HH:mm')}</span>}
                                                            <div className="flex items-center justify-between gap-1">
                                                                <span className="truncate font-semibold">{evt.title}</span>
                                                                {evt.alert && <Bell className="w-2.5 h-2.5 text-amber-500 shrink-0" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedDate={selectedDate}
                event={selectedEvent}
                onRefresh={fetchEvents}
                session={session}
            />
        </div >
    );
}
