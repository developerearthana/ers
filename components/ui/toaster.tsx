"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Types ---
type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, "id">) => void;
    removeToast: (id: string) => void;
}

// --- Store ---
// Using a simple event-based system if zustand isn't available, but let's assume standard React state for simplicity if needed.
// Actually, for a global toaster without context hell, a tiny external store is best.
// I'll implement a tiny observer pattern here to avoid dependency issues if 'zustand' isn't in package.json (Checking package.json in parallel).
// Wait, I see 'zustand' is NOT in the previous package.json view (Step 5).
// So I will write a custom event emitter for the toaster.

const listeners: Set<(toasts: Toast[]) => void> = new Set();
let toasts: Toast[] = [];

function emitChange() {
    listeners.forEach((l) => l([...toasts]));
}

export const toast = {
    success: (message: string, duration = 3000) => {
        addToast({ type: "success", message, duration });
    },
    error: (message: string, duration = 4000) => {
        addToast({ type: "error", message, duration });
    },
    warning: (message: string, duration = 3000) => {
        addToast({ type: "warning", message, duration });
    },
    info: (message: string, duration = 3000) => {
        addToast({ type: "info", message, duration });
    },
};

function addToast(toast: Omit<Toast, "id">) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    toasts = [...toasts, newToast];
    emitChange();

    if (toast.duration !== Infinity) {
        setTimeout(() => {
            removeToast(id);
        }, toast.duration);
    }
}

function removeToast(id: string) {
    toasts = toasts.filter((t) => t.id !== id);
    emitChange();
}

// --- Component ---
export function Toaster() {
    const [visibleToasts, setVisibleToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const handleToastsChange = (newToasts: Toast[]) => {
            setVisibleToasts(newToasts);
        };
        listeners.add(handleToastsChange);
        return () => {
            listeners.delete(handleToastsChange);
        };
    }, []);

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none p-4">
            <AnimatePresence>
                {visibleToasts.map((t) => (
                    <ToastItem key={t.id} toast={t} />
                ))}
            </AnimatePresence>
        </div>
    );
}

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const styles = {
    success: "border-green-500/50 bg-white/90 text-green-900 dark:bg-green-900/90 dark:text-green-100",
    error: "border-red-500/50 bg-red-50/90 text-red-900 dark:bg-red-900/90 dark:text-red-100",
    warning: "border-yellow-500/50 bg-yellow-50/90 text-yellow-900 dark:bg-yellow-900/90 dark:text-yellow-100",
    info: "border-blue-500/50 bg-white/90 text-blue-900 dark:bg-blue-900/90 dark:text-blue-100",
};

function ToastItem({ toast }: { toast: Toast }) {
    const Icon = icons[toast.type];

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            layout
            className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-4 rounded-xl border p-4 shadow-lg backdrop-blur-md",
                styles[toast.type]
            )}
        >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1 text-sm font-medium">{toast.message}</div>
            <button
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
                className="text-current opacity-70 hover:opacity-100"
            >
                <X className="h-4 w-4" />
            </button>
        </motion.div>
    );
}
