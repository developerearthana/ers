"use client";

import { PageWrapper, CardWrapper } from '@/components/ui/page-wrapper';
import { Home, ClipboardList, MessageSquare, Star } from 'lucide-react';

export default function CustomerDashboard() {
    const stats = [
        { label: "Active Project", value: "Gridwise IoT", icon: Home, color: "bg-indigo-100 text-indigo-600" },
        { label: "Completion", value: "65%", icon: ClipboardList, color: "bg-blue-100 text-blue-600" },
        { label: "Unread Updates", value: "2", icon: MessageSquare, color: "bg-white text-pink-600" },
        { label: "Satisfaction", value: "4.8/5", icon: Star, color: "bg-yellow-100 text-yellow-600" },
    ];

    return (
        <PageWrapper>
            <div className="mb-6">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Client Dashboard</h1>
                <p className="text-gray-500 mt-1">Track progress, view documents, and communicate with the team.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4 mb-6">
                {stats.map((stat, i) => (
                    <CardWrapper key={i} delay={i * 0.1} className="glass-card p-5 rounded-xl border border-white/50 bg-white/40">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                                <h3 className="text-xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                    </CardWrapper>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <CardWrapper delay={0.4} className="glass-card p-5 rounded-xl col-span-2">
                    <h3 className="text-lg font-bold mb-4">Project Milestones</h3>
                    <div className="relative border-l border-gray-200 ml-3 space-y-6">
                        <div className="mb-8 ml-6">
                            <span className="absolute flex items-center justify-center w-6 h-6 bg-green-100 rounded-full -left-3 ring-8 ring-white">
                                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                            </span>
                            <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">Design Phase Completed</h3>
                            <time className="block mb-2 text-sm font-normal leading-none text-gray-400">Released on January 2nd, 2026</time>
                            <p className="mb-4 text-base font-normal text-gray-500">The initial architectural designs and blueprints have been finalized and approved.</p>
                        </div>
                        <div className="mb-8 ml-6">
                            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
                                <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
                            </span>
                            <h3 className="mb-1 text-lg font-semibold text-gray-900">Foundation Work</h3>
                            <time className="block mb-2 text-sm font-normal leading-none text-gray-400">Currently in progress</time>
                            <p className="text-base font-normal text-gray-500">Excavation and concrete pouring for the main structure.</p>
                        </div>
                    </div>
                </CardWrapper>

                <CardWrapper delay={0.5} className="glass-card p-5 rounded-xl">
                    <h3 className="text-lg font-bold mb-4">Feedback & Approvals</h3>
                    <div className="bg-white p-4 rounded-lg border border-border mb-4">
                        <h4 className="font-bold text-blue-900 text-sm">Action Required</h4>
                        <p className="text-xs text-blue-700 mt-1">Please review the updated material selection list.</p>
                        <button className="mt-3 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition">Review Now</button>
                    </div>
                </CardWrapper>
            </div>
        </PageWrapper>
    );
}
