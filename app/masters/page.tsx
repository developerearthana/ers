"use client";

import { useState } from 'react';
import { Building2, Layers, Users, Network, Briefcase, ArrowRight, Tag, BarChart3, LayoutGrid, Grid2X2 } from 'lucide-react';
import Link from 'next/link';

export default function MastersDashboard() {
    const cards = [
        { name: 'Company', desc: 'Manage company details & branding', href: '/masters/company', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' },
        { name: 'Subsidiaries', desc: 'Configure branch offices & entities', href: '/masters/subsidiaries', icon: Layers, color: 'text-purple-600', bg: 'bg-purple-100' },
        { name: 'Departments', desc: 'Setup functional units (HR, IT...)', href: '/masters/departments', icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-100' },
        { name: 'Teams', desc: 'Organize workforce groups', href: '/masters/teams', icon: Network, color: 'text-green-600', bg: 'bg-green-100' },
        { name: 'Users', desc: 'Manage access & roles', href: '/masters/users', icon: Users, color: 'text-pink-600', bg: 'bg-white' },
        { name: 'Vendor Categories', desc: 'Classify vendor types', href: '/masters/vendor-categories', icon: Tag, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { name: 'KPI Metrics', desc: 'Define performance indicators', href: '/masters/kpi-metrics', icon: BarChart3, color: 'text-teal-600', bg: 'bg-teal-100' },
        { name: 'Project Templates', desc: 'Configure stage workflows', href: '/masters/project-templates', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    ];

    const [viewMode, setViewMode] = useState<'grid-sm' | 'grid-md' | 'list'>('grid-md');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Masters Configuration</h1>
                    <p className="text-gray-500">Manage your organizational structure and system settings.</p>
                </div>

                {/* View Toggles */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        aria-label="List View"
                    >
                        <Layers className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid-sm')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid-sm' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        aria-label="Small Grid View"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid-md')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid-md' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        aria-label="Medium Grid View"
                    >
                        <Grid2X2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className={`
                ${viewMode === 'list' ? 'flex flex-col gap-3' : ''}
                ${viewMode === 'grid-sm' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : ''}
                ${viewMode === 'grid-md' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : ''}
            `}>
                {cards.map((card) => {
                    const Icon = card.icon;

                    if (viewMode === 'list') {
                        return (
                            <Link key={card.name} href={card.href} className="group block">
                                <div className="bg-white border rounded-lg p-4 hover:shadow-sm transition-all hover:border-blue-200 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${card.bg}`}>
                                            <Icon className={`w-5 h-5 ${card.color}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{card.name}</h3>
                                            <p className="text-sm text-gray-500">{card.desc}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                </div>
                            </Link>
                        );
                    }

                    return (
                        <Link key={card.name} href={card.href} className="group">
                            <div className={`bg-white border rounded-xl hover:shadow-md transition-all hover:border-blue-200 h-full flex flex-col
                                ${viewMode === 'grid-sm' ? 'p-4' : 'p-6'}
                            `}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`rounded-xl ${viewMode === 'grid-sm' ? 'p-2' : 'p-3'} ${card.bg}`}>
                                        <Icon className={` ${viewMode === 'grid-sm' ? 'w-5 h-5' : 'w-6 h-6'} ${card.color}`} />
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <h3 className={`font-bold text-gray-900 mb-1 ${viewMode === 'grid-sm' ? 'text-base' : 'text-lg'}`}>{card.name}</h3>
                                <p className={`text-gray-500 ${viewMode === 'grid-sm' ? 'text-xs line-clamp-2' : 'text-sm'}`}>{card.desc}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
