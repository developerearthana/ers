"use client";

import { motion } from 'framer-motion';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function AttendanceHeatmap() {
    const today = new Date();
    const last30Days = eachDayOfInterval({
        start: subDays(today, 29),
        end: today
    });

    // Mock random data for Late Arrivals
    const getLateCount = (date: Date): { count: number, className: string } => {
        if (date.getDay() === 0) return { count: 0, className: "bg-background" }; // Sunday

        const hash = date.getDate() * (date.getMonth() + 1);
        const count = hash % 6 === 0 ? Math.floor(Math.random() * 5) + 1 : 0; // Occasional late spikes

        let className = "bg-emerald-100"; // On time
        if (count === 1) className = "bg-orange-200";
        if (count === 2) className = "bg-orange-300";
        if (count >= 3) className = "bg-red-400";

        return { count, className };
    };

    return (
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h4 className="font-bold text-gray-900">Attendance Punctuality Pulse</h4>
                    <p className="text-xs text-gray-500">Late arrivals heat map (Last 30 Days)</p>
                </div>
                <div className="flex gap-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-100 rounded-full"></div> On Time</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-300 rounded-full"></div> Late</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-400 rounded-full"></div> Critical</span>
                </div>
            </div>

            <div className="flex justify-between gap-1 overflow-x-auto pb-2">
                <TooltipProvider>
                    {last30Days.map((day) => {
                        const { count, className } = getLateCount(day);
                        return (
                            <Tooltip key={day.toISOString()}>
                                <TooltipTrigger>
                                    <motion.div
                                        whileHover={{ scale: 1.2, zIndex: 10 }}
                                        className={`flex-1 min-w-[3px] h-12 rounded-sm ${className}`}
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-bold text-xs">{format(day, 'EEE, MMM d')}</p>
                                    <p className="text-xs text-gray-500">{count > 0 ? `${count} Late Arrivals` : 'All On Time'}</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </TooltipProvider>
            </div>
        </div>
    );
}

