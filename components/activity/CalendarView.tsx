"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, isToday, addWeeks, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getEvents } from "@/app/actions/activity/calendar";
import EventModal from "./EventModal";
import { motion, AnimatePresence } from "framer-motion";

export default function CalendarView() {
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedEvent, setSelectedEvent] = useState<any>(undefined);

    const fetchEvents = async () => {
        setLoading(true);
        let start, end;

        // Fetch slightly wider range to capture events spanning boundaries
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

    // Generate days for the grid
    const getCalendarDays = () => {
        if (viewMode === 'week') {
            return eachDayOfInterval({
                start: startOfWeek(currentDate, { weekStartsOn: 1 }),
                end: endOfWeek(currentDate, { weekStartsOn: 1 })
            });
        }
        // Month view: Fixed 5 weeks (35 days) for consistency
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

    // Check if an event covers this specific day
    const getDayEvents = (date: Date) => {
        return events.filter(event => {
            const eventStart = startOfDay(new Date(event.start));
            const eventEnd = event.end ? endOfDay(new Date(event.end)) : endOfDay(new Date(event.start));
            const dayStart = startOfDay(date);

            return isWithinInterval(dayStart, { start: eventStart, end: eventEnd });
        });
    };

    // Configurable Colors
    const getEventColor = (type: string) => {
        switch (type) {
            case 'Meeting': return 'bg-white0';
            case 'Task': return 'bg-white0';
            case 'Reminder': return 'bg-amber-500';
            case 'Holiday': return 'bg-white0';
            default: return 'bg-background0';
        }
    };

    // Style helper for events
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
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-white/50 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-sm gap-4">
                {/* ... same header ... */}
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

            {/* Calendar Grid */}
            <div className="flex-1 bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-xl rounded-3xl border border-white/60 overflow-hidden flex flex-col shadow-2xl shadow-blue-900/5">
                {/* Weekday Headers */}
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

                {/* Grid */}
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

                                // Check if this day is part of any event range to potentially color-code the background
                                // Simply checking dayEvents.length > 0
                                const hasEvents = dayEvents.length > 0;

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
                                            // Optional: highlight day if it has events? Currently user asked for Range Selected color.
                                            // The range is selected via Event Modal usually, here we just show existing events.
                                            // If an event spans this day, we show the event bar.
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
                                            {(isCurrentMonth || viewMode === 'week') && dayEvents.map((evt, evtIdx) => {
                                                const typeColor = getEventColor(evt.type || 'Meeting');
                                                const styleClass = getEventStyle(evt.type || 'Meeting');

                                                return (
                                                    <div
                                                        key={`${evt._id}-${day.toISOString()}`} // Unique key per day instance
                                                        onClick={(e) => handleEventClick(e, evt)}
                                                        className={cn(
                                                            "text-[10px] px-2 py-1.5 rounded-lg truncate font-medium border border-transparent hover:scale-[1.02] active:scale-95 transition-all shadow-sm flex items-center gap-1.5",
                                                            styleClass,
                                                            viewMode === 'week' && "py-2"
                                                        )}
                                                    >
                                                        <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", typeColor)} />
                                                        <div className="flex flex-col min-w-0">
                                                            {/* Show time only on Start Day */}
                                                            {isSameDay(new Date(evt.start), day) && <span className="opacity-90 leading-tight">{format(new Date(evt.start), 'HH:mm')}</span>}
                                                            <span className="truncate font-semibold">{evt.title}</span>
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
            />
        </div >
    );
}

