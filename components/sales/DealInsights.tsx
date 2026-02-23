"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Clock, Zap } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface DealInsightsProps {
    probability: number;
    health: "Healthy" | "Needs Attention" | "At Risk";
    factors?: string[];
    suggestedAction?: { action: string; priority: "high" | "medium" | "low" };
    compact?: boolean;
}

export function DealInsights({ probability, health, factors = [], suggestedAction, compact = false }: DealInsightsProps) {
    const getHealthColor = () => {
        if (health === "Healthy") return "text-emerald-600";
        if (health === "Needs Attention") return "text-amber-600";
        return "text-red-600";
    };

    const getHealthBg = () => {
        if (health === "Healthy") return "bg-emerald-50 border-emerald-200";
        if (health === "Needs Attention") return "bg-amber-50 border-amber-200";
        return "bg-red-50 border-red-200";
    };

    const getHealthIcon = () => {
        if (health === "Healthy") return <CheckCircle2 className="w-3 h-3" />;
        if (health === "Needs Attention") return <Clock className="w-3 h-3" />;
        return <AlertCircle className="w-3 h-3" />;
    };

    const getProbabilityColor = () => {
        if (probability >= 70) return "stroke-emerald-500";
        if (probability >= 40) return "stroke-amber-500";
        return "stroke-red-500";
    };

    // Circular progress ring
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (probability / 100) * circumference;

    if (compact) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold border cursor-help",
                            getHealthBg()
                        )}>
                            <div className="relative w-6 h-6">
                                <svg className="w-6 h-6 -rotate-90" viewBox="0 0 48 48">
                                    <circle
                                        cx="24" cy="24" r={radius}
                                        fill="none"
                                        strokeWidth="4"
                                        className="stroke-gray-200"
                                    />
                                    <circle
                                        cx="24" cy="24" r={radius}
                                        fill="none"
                                        strokeWidth="4"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        strokeLinecap="round"
                                        className={cn("transition-all duration-500", getProbabilityColor())}
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black">
                                    {probability}%
                                </span>
                            </div>
                            <span className={cn("flex items-center gap-0.5", getHealthColor())}>
                                {getHealthIcon()}
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="p-3 min-w-[180px]">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-900">Win Probability</span>
                                <span className={cn("text-lg font-black", getHealthColor())}>{probability}%</span>
                            </div>
                            <div className={cn("text-[10px] font-medium px-2 py-1 rounded", getHealthBg(), getHealthColor())}>
                                {health}
                            </div>
                            {factors.length > 0 && (
                                <div className="text-[10px] text-gray-500 space-y-1 pt-1 border-t">
                                    {factors.map((f, i) => (
                                        <div key={i} className="flex items-start gap-1">
                                            <span className="text-gray-300">•</span>
                                            <span>{f}</span>
                                        </div>
                                    ))}
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
        <div className={cn("p-4 rounded-xl border", getHealthBg())}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                    <Zap className="w-4 h-4 text-amber-500" /> Deal Insights
                </span>
                <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1",
                    getHealthBg(), getHealthColor()
                )}>
                    {getHealthIcon()} {health}
                </span>
            </div>

            <div className="flex items-center gap-4">
                {/* Probability Ring */}
                <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 48 48">
                        <circle
                            cx="24" cy="24" r={radius}
                            fill="none"
                            strokeWidth="4"
                            className="stroke-gray-200"
                        />
                        <circle
                            cx="24" cy="24" r={radius}
                            fill="none"
                            strokeWidth="4"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className={cn("transition-all duration-500", getProbabilityColor())}
                        />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-gray-900">
                        {probability}%
                    </span>
                </div>

                <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Win Probability</p>
                    <div className="flex items-center gap-1">
                        {probability >= 50 ? (
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={cn("text-sm font-bold", probability >= 50 ? "text-emerald-600" : "text-red-600")}>
                            {probability >= 70 ? "Strong" : probability >= 40 ? "Moderate" : "Low"}
                        </span>
                    </div>
                </div>
            </div>

            {suggestedAction && (
                <div className="mt-3 pt-3 border-t border-gray-200/50">
                    <button className={cn(
                        "w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all",
                        suggestedAction.priority === "high"
                            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:scale-[1.02]"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-background"
                    )}>
                        <Zap className="w-3 h-3" />
                        {suggestedAction.action}
                    </button>
                </div>
            )}
        </div>
    );
}

