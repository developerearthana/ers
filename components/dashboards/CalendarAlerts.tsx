"use client";

import { useEffect, useState } from "react";
import { Bell, X, Clock } from "lucide-react";
import { format } from "date-fns";
import { getUpcomingAlerts } from "@/app/actions/activity/calendar";
import { motion, AnimatePresence } from "framer-motion";

export default function CalendarAlerts() {
    const [alerts, setAlerts] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            const isEnabled = localStorage.getItem('earthana_dashboard_alerts') !== 'false';
            if (!isEnabled) {
                setAlerts([]);
                return;
            }
            try {
                const res = await getUpcomingAlerts();
                if (res.success && res.data?.length > 0) {
                    setAlerts(res.data);
                }
            } catch (err) {
                console.error("Failed to load alerts", err);
            }
        };
        load();
    }, []);

    if (alerts.length === 0) return null;

    const dismissAlert = (alertId: string) => {
        setAlerts(prev => prev.filter(a => (a._id || a.id) !== alertId));
    };

    return (
        <div className="space-y-2 mb-6 px-1">
            <AnimatePresence>
                {alerts.map((alert: any) => {
                    const alertId = alert._id || alert.id;
                    return (
                        <motion.div
                            key={alertId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group flex items-center justify-between bg-white border-l-4 border-l-amber-500 border border-amber-100 p-3 rounded-r-xl shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                    <Bell className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm leading-tight">{alert.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                            Upcoming
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            {format(new Date(alert.start), 'HH:mm')} ({format(new Date(alert.start), 'MMM d')})
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => dismissAlert(alertId)}
                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                aria-label="Dismiss alert"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
