"use client";

import { cn } from "@/lib/utils";
import { Sparkles, TrendingUp, Flame, Snowflake, Thermometer } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface AILeadScoreProps {
    score: number;
    label: "Hot" | "Warm" | "Cold";
    breakdown?: {
        source: number;
        value: number;
        engagement: number;
        status: number;
        recency: number;
    };
    compact?: boolean;
}

export function AILeadScoreCard({ score, label, breakdown, compact = false }: AILeadScoreProps) {
    const getScoreColor = () => {
        if (label === "Hot") return "from-orange-500 to-red-500";
        if (label === "Warm") return "from-amber-400 to-orange-400";
        return "from-blue-400 to-cyan-400";
    };

    const getScoreBg = () => {
        if (label === "Hot") return "bg-gradient-to-br from-orange-50 to-red-50 border-orange-200";
        if (label === "Warm") return "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200";
        return "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200";
    };

    const getIcon = () => {
        if (label === "Hot") return <Flame className="w-3 h-3" />;
        if (label === "Warm") return <Thermometer className="w-3 h-3" />;
        return <Snowflake className="w-3 h-3" />;
    };

    if (compact) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-help",
                            getScoreBg()
                        )}>
                            <Sparkles className="w-3 h-3" />
                            <span className={cn("bg-gradient-to-r bg-clip-text text-transparent", getScoreColor())}>
                                {score}
                            </span>
                            {getIcon()}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="p-0 overflow-hidden">
                        <div className="p-3 space-y-2 min-w-[180px]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-amber-500" /> AI Score
                                </span>
                                <span className={cn(
                                    "text-lg font-black bg-gradient-to-r bg-clip-text text-transparent",
                                    getScoreColor()
                                )}>{score}</span>
                            </div>
                            {breakdown && (
                                <div className="space-y-1 text-[10px]">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Source Quality</span>
                                        <span className="font-bold">{breakdown.source}/25</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Est. Value</span>
                                        <span className="font-bold">{breakdown.value}/25</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Engagement</span>
                                        <span className="font-bold">{breakdown.engagement}/25</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Status</span>
                                        <span className="font-bold">{breakdown.status}/15</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Recency</span>
                                        <span className="font-bold">{breakdown.recency}/10</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    // Full card view
    return (
        <div className={cn("p-4 rounded-xl border shadow-sm", getScoreBg())}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-amber-500" /> AI Score
                </span>
                <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1",
                    label === "Hot" ? "bg-red-100 text-red-700" :
                        label === "Warm" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                )}>
                    {getIcon()} {label}
                </span>
            </div>

            <div className="flex items-end gap-2 mb-3">
                <span className={cn(
                    "text-4xl font-black bg-gradient-to-r bg-clip-text text-transparent",
                    getScoreColor()
                )}>{score}</span>
                <span className="text-sm text-gray-400 mb-1">/100</span>
            </div>

            {/* Score bar */}
            <div className="h-2 bg-white rounded-full overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full bg-gradient-to-r transition-all",
                        getScoreColor(),
                        `w-[${score}%]`
                    )}
                />
            </div>

            {breakdown && (
                <div className="mt-4 pt-3 border-t border-gray-200/50 grid grid-cols-5 gap-1 text-center">
                    <div className="text-[9px]">
                        <div className="font-bold text-gray-700">{breakdown.source}</div>
                        <div className="text-gray-400">Source</div>
                    </div>
                    <div className="text-[9px]">
                        <div className="font-bold text-gray-700">{breakdown.value}</div>
                        <div className="text-gray-400">Value</div>
                    </div>
                    <div className="text-[9px]">
                        <div className="font-bold text-gray-700">{breakdown.engagement}</div>
                        <div className="text-gray-400">Engage</div>
                    </div>
                    <div className="text-[9px]">
                        <div className="font-bold text-gray-700">{breakdown.status}</div>
                        <div className="text-gray-400">Status</div>
                    </div>
                    <div className="text-[9px]">
                        <div className="font-bold text-gray-700">{breakdown.recency}</div>
                        <div className="text-gray-400">Recent</div>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Smart Action Chip - Displays AI-suggested next action
 */
interface SmartActionProps {
    action: string;
    priority: "high" | "medium" | "low";
    icon?: string;
    onClick?: () => void;
}

export function SmartActionChip({ action, priority, onClick }: SmartActionProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all hover:scale-105 active:scale-95",
                priority === "high" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20" :
                    priority === "medium" ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20" :
                        "bg-white text-gray-600 hover:bg-white"
            )}
        >
            <TrendingUp className="w-3 h-3" />
            {action}
        </button>
    );
}
