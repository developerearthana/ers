"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, TrendingDown, ArrowRight } from "lucide-react";
import { CardWrapper } from "@/components/ui/page-wrapper";
import Link from "next/link";

interface AtRiskDeal {
    _id: string;
    client: string;
    value: number;
    stage: string;
    daysSinceUpdate: number;
    probability: number;
    health: string;
    riskReason: string;
}

interface AtRiskDealsProps {
    deals: AtRiskDeal[];
    loading?: boolean;
}

export function AtRiskDeals({ deals, loading = false }: AtRiskDealsProps) {
    if (loading) {
        return (
            <CardWrapper className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-white rounded animate-pulse" />
                    <div className="h-5 w-32 bg-white rounded animate-pulse" />
                </div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-white rounded-lg animate-pulse" />
                ))}
            </CardWrapper>
        );
    }

    if (deals.length === 0) {
        return (
            <CardWrapper className="p-6 text-center">
                <div className="text-emerald-500 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="font-bold text-gray-900">All Deals Healthy!</h3>
                <p className="text-sm text-gray-500">No at-risk deals detected</p>
            </CardWrapper>
        );
    }

    return (
        <CardWrapper className="overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">At-Risk Deals</h3>
                            <p className="text-xs text-gray-500">{deals.length} deals need attention</p>
                        </div>
                    </div>
                    <Link
                        href="/sales/pipeline"
                        className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                        View All <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>

            <div className="divide-y divide-gray-100">
                {deals.slice(0, 5).map(deal => (
                    <div
                        key={deal._id}
                        className="p-4 hover:bg-background transition-colors group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-red-600 font-bold text-xs">
                                    {deal.client.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                        {deal.client}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="bg-white px-1.5 py-0.5 rounded">{deal.stage}</span>
                                        <span>₹{deal.value?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className={cn(
                                    "text-sm font-bold",
                                    deal.probability < 30 ? "text-red-600" : "text-orange-500"
                                )}>
                                    {deal.probability}% Win
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                    {deal.riskReason === 'Stagnant' ? (
                                        <>
                                            <Clock className="w-3 h-3" />
                                            {deal.daysSinceUpdate} days idle
                                        </>
                                    ) : (
                                        <>
                                            <TrendingDown className="w-3 h-3" />
                                            Low probability
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </CardWrapper>
    );
}

