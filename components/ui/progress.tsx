"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number
    indicatorClassName?: string
}

export function Progress({ className, value = 0, indicatorClassName, ...props }: ProgressProps) {
    return (
        <div
            className={cn("w-full bg-white rounded-full h-2 overflow-hidden", className)}
            {...props}
        >
            <div
                className={cn("h-full transition-all duration-500 rounded-full progress-indicator", indicatorClassName)}
            />
            <style jsx>{`
                .progress-indicator {
                    width: ${value}%;
                }
            `}</style>
        </div>
    )
}
