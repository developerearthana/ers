"use client";

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Package, AlertCircle } from 'lucide-react';

// Mock Data for Warehouse Layout
const WAREHOUSE_ZONES = [
    { id: 'A', name: 'Zone A', type: 'High Value', color: 'bg-emerald-100 border-emerald-200' },
    { id: 'B', name: 'Zone B', type: 'Bulk Storage', color: 'bg-blue-100 border-blue-200' },
    { id: 'C', name: 'Zone C', type: 'Receiving', color: 'bg-amber-100 border-amber-200' },
];

const RACKS = [
    { id: 'A1', zone: 'A', slots: 12, fill: 80, items: ['Sensors', 'Controllers'] },
    { id: 'A2', zone: 'A', slots: 12, fill: 45, items: ['Displays'] },
    { id: 'A3', zone: 'A', slots: 12, fill: 90, items: ['Processors'], alert: true },
    { id: 'B1', zone: 'B', slots: 20, fill: 60, items: ['Casing', 'Frames'] },
    { id: 'B2', zone: 'B', slots: 20, fill: 20, items: ['Mounts'] },
    { id: 'C1', zone: 'C', slots: 8, fill: 10, items: ['Unsorted'], status: 'processing' },
];

export function WarehouseLayout() {
    return (
        <div className="glass-card p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden bg-white/50 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Digital Warehouse Map</h3>
                    <p className="text-sm text-gray-500">Live storage visualization & capacity 2D View</p>
                </div>
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-emerald-500"></div> <span>Healthy</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-amber-500"></div> <span>Low Stock</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-500"></div> <span>Critical</span>
                    </div>
                </div>
            </div>

            {/* Simulated Warehouse Grid */}
            <div className="relative min-h-[400px] border-2 border-dashed border-gray-200 rounded-lg p-8 bg-background/50">
                {/* Zones Layer */}
                <div className="absolute inset-0 p-8 grid grid-cols-3 gap-8 pointer-events-none">
                    {WAREHOUSE_ZONES.map(zone => (
                        <div key={zone.id} className={cn("rounded-3xl opacity-30 flex items-center justify-center text-4xl font-black text-gray-900/10 uppercase tracking-tighter border-4 border-dashed", zone.color)}>
                            {zone.name}
                        </div>
                    ))}
                </div>

                {/* Racks Layer (Interactive) */}
                <div className="relative z-10 grid grid-cols-3 gap-8 h-full">
                    {['A', 'B', 'C'].map(zoneId => (
                        <div key={zoneId} className="flex flex-col gap-4">
                            {RACKS.filter(r => r.zone === zoneId).map(rack => (
                                <motion.div
                                    key={rack.id}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className={cn(
                                        "relative group cursor-pointer bg-white rounded-lg border shadow-sm p-3 transition-all",
                                        rack.alert ? "border-red-300 ring-2 ring-red-100" : "border-gray-200 hover:border-primary/50"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-gray-700">Rack {rack.id}</span>
                                        {rack.alert && <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />}
                                    </div>

                                    {/* Storage Visualizer */}
                                    <div className="grid grid-cols-4 gap-1 mb-2">
                                        {Array.from({ length: rack.slots }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "h-1.5 rounded-full transition-all duration-500",
                                                    (i / rack.slots) * 100 < rack.fill
                                                        ? (rack.alert ? "bg-red-400" : "bg-emerald-400")
                                                        : "bg-white"
                                                )}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-end mt-2">
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                            <Package className="w-3 h-3" />
                                            {rack.items.join(', ')}
                                        </div>
                                        <span className={cn(
                                            "text-xs font-bold",
                                            rack.fill > 85 ? "text-red-600" : "text-gray-900"
                                        )}>
                                            {rack.fill}% used
                                        </span>
                                    </div>

                                    {/* Hover Details */}
                                    <div className="absolute inset-0 bg-white/90 rounded-lg p-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center text-center backdrop-blur-sm">
                                        <p className="text-white font-bold text-sm mb-1">{rack.items[0]}</p>
                                        <p className="text-gray-400 text-xs">{rack.slots} Bins Available, {Math.floor(rack.slots * (rack.fill / 100))} Occupied</p>
                                        <button className="mt-3 px-3 py-1 bg-white text-gray-900 text-xs font-bold rounded hover:bg-white">
                                            Inspect
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend / Info */}
            <div className="mt-6 flex gap-6 text-sm text-gray-500">
                <p>💡 <span className="font-medium text-gray-700">Tip:</span> Hover over racks to inspect contents.</p>
                <p>⚠️ <span className="font-medium text-gray-700">Alert:</span> Red pulsing indicates stock irregularities or overflow.</p>
            </div>
        </div>
    );
}

