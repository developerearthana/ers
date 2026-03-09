"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageWrapperProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    onClick?: () => void;
}

export function PageWrapper({ children, className, delay = 0, onClick }: PageWrapperProps) {
    return (
        <motion.div
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut", delay }}
            className={cn("w-full h-full", className)}
        >
            {children}
        </motion.div>
    );
}

export function CardWrapper({ children, className, delay = 0.1, onClick }: PageWrapperProps) {
    return (
        <motion.div
            onClick={onClick}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut", delay }}
            className={cn("glass-card p-6", className)}
        >
            {children}
        </motion.div>
    );
}
