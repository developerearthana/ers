"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Activity {
    date: Date;
    count: number;
    intensity: 'low' | 'medium' | 'high';
}

export function ActivityHeatmap() {
    const today = new Date();
    const last30Days = eachDayOfInterval({
        start: subDays(today, 29),
        end: today
    });

    // Mock random data
    const getActivity = (date: Date): { count: number, className: string } => {
        const hash = date.getDate() * (date.getMonth() + 1);
        const count = hash % 5; // 0 to 4 activities

        let className = "bg-white";
        if (count === 1) className = "bg-emerald-200";
        if (count === 2) className = "bg-emerald-300";
        if (count === 3) className = "bg-emerald-400";
        if (count >= 4) className = "bg-emerald-500";

        return { count, className };
    };

    return (
        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-sm font-bold text-gray-900 mb-4">Lead Engagement Count (Last 30 Days)</h4>

            <div className="flex gap-1 overflow-x-auto pb-2">
                <TooltipProvider>
                    {last30Days.map((day) => {
                        const { count, className } = getActivity(day);
                        return (
                            <Tooltip key={day.toISOString()}>
                                <TooltipTrigger>
                                    <motion.div
                                        whileHover={{ scale: 1.2, zIndex: 10 }}
                                        className={`w-3 h-8 md:w-4 md:h-12 rounded-sm ${className}`}
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-bold text-xs">{format(day, 'MMM d')}</p>
                                    <p className="text-xs text-gray-500">{count} activities</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </TooltipProvider>
            </div>

            <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>{format(subDays(today, 29), 'MMM d')}</span>
                <span className="flex items-center gap-1">
                    Less <div className="w-2 h-2 bg-emerald-200 rounded-sm"></div> <div className="w-2 h-2 bg-emerald-500 rounded-sm"></div> More
                </span>
                <span>Today</span>
            </div>
        </div>
    );
}
