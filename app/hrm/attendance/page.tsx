"use client";

import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Edit3, FileText, Download, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { PageWrapper, CardWrapper } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AttendancePage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isPunchedIn, setIsPunchedIn] = useState(false);
    const [punchInTime, setPunchInTime] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'calendar' | 'reports'>('calendar');
    const [isAdminMode, setIsAdminMode] = useState(false);

    const handlePunch = () => {
        if (!isPunchedIn) {
            setPunchInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            setIsPunchedIn(true);
        } else {
            setIsPunchedIn(false);
            setPunchInTime(null);
        }
    };

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Mock Calendar Data
    const calendarEvents: Record<string, { type: string, color: string }> = {
        '2026-01-01': { type: 'Holiday', color: 'bg-red-100 text-red-600 border-red-200' },
        '2026-01-26': { type: 'Holiday', color: 'bg-red-100 text-red-600 border-red-200' },
        '2026-01-15': { type: 'Leave', color: 'bg-yellow-100 text-yellow-600 border-yellow-200' },
    };

    const attendanceData: Record<string, { status: string, in: string, out: string }> = {
        '2026-01-02': { status: 'Present', in: '09:00', out: '18:00' },
        '2026-01-05': { status: 'Present', in: '09:15', out: '18:10' },
        '2026-01-06': { status: 'WFH', in: '08:50', out: '17:50' },
    };

    return (
        <PageWrapper className="space-y-6 max-w-7xl mx-auto p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Attendance</h1>
                    <p className="text-muted-foreground mt-1">Track work hours, leaves, and team presence.</p>
                </div>

                <div className="glass-card p-1 rounded-xl flex items-center gap-1 bg-white/50 border border-gray-200">
                    <button
                        onClick={() => setActiveTab('calendar')}
                        className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all", activeTab === 'calendar' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900')}
                    >
                        <CalendarIcon className="w-4 h-4" /> Calendar
                    </button>
                    <div className="w-px h-6 bg-white mx-1" />
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all", activeTab === 'reports' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900')}
                    >
                        <FileText className="w-4 h-4" /> Reports
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Punch Card */}
                <CardWrapper className="glass-card p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-white/60 shadow-lg">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-primary">
                        <Clock className="w-40 h-40" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Mark Attendance</h2>
                                <p className="text-sm text-gray-500 font-medium mt-1">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-mono font-bold text-gray-900 tracking-tight">{format(new Date(), 'HH:mm')}</p>
                            </div>
                        </div>

                        <div className="my-10 flex justify-center">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={handlePunch}
                                className={cn(
                                    "w-48 h-48 rounded-full border-[6px] flex flex-col items-center justify-center transition-all shadow-2xl relative group",
                                    isPunchedIn
                                        ? "border-red-100 bg-gradient-to-br from-red-50 to-red-100 text-red-600 shadow-red-500/20"
                                        : "border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 shadow-emerald-500/20"
                                )}
                            >
                                <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                                <span className="text-4xl font-black mb-1 tracking-wider">{isPunchedIn ? 'STOP' : 'START'}</span>
                                <span className="text-xs uppercase font-bold tracking-[0.2em] opacity-80">{isPunchedIn ? 'Punch Out' : 'Punch In'}</span>
                            </motion.button>
                        </div>

                        <AnimatePresence>
                            {isPunchedIn && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="bg-emerald-50/80 backdrop-blur-sm p-4 rounded-xl flex items-center gap-4 border border-emerald-100"
                                >
                                    <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide">Currently Active</p>
                                        <p className="text-sm font-medium text-emerald-800">Started at <span className="font-bold">{punchInTime}</span></p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </CardWrapper>

                {/* Calendar Grid */}
                <CardWrapper delay={0.1} className="glass-card p-6 rounded-2xl md:col-span-2 border-white/40 shadow-xl bg-white/40 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-px bg-white/50 rounded-lg overflow-hidden border border-gray-200/50">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider py-3 bg-background/80">
                                {day}
                            </div>
                        ))}

                        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-24 bg-background/30" />
                        ))}

                        {calendarDays.map((day) => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const event = calendarEvents[dateStr];
                            const attendance = attendanceData[dateStr];
                            const isCurrentDay = isToday(day);

                            return (
                                <div key={dateStr} className={cn(
                                    "h-24 p-2 relative bg-white transition-colors hover:bg-background flex flex-col justify-between",
                                    isCurrentDay && "bg-white/30 ring-inset ring-2 ring-primary/20 z-10"
                                )}>
                                    <div className="flex justify-between items-start">
                                        <span className={cn("text-sm font-semibold", isCurrentDay ? "text-primary" : "text-gray-700")}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        {event && (
                                            <div className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium truncate border", event.color)}>
                                                {event.type}
                                            </div>
                                        )}
                                        {attendance && (
                                            <div className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium truncate flex justify-between",
                                                attendance.status === 'Present' ? "bg-emerald-100 text-emerald-700" :
                                                    attendance.status === 'WFH' ? "bg-purple-100 text-purple-700" : "bg-white"
                                            )}>
                                                <span>{attendance.status === 'Present' ? 'P' : 'WFH'}</span>
                                                <span className="opacity-70">{attendance.in}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardWrapper>
            </div>
        </PageWrapper>
    );
}
