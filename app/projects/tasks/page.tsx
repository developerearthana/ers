"use client";

import { PageWrapper } from '@/components/ui/page-wrapper';
import { Construction } from 'lucide-react';

export default function TasksPage() {
    return (
        <PageWrapper className="flex items-center justify-center h-[60vh]">
            <div className="text-center space-y-4">
                <div className="bg-white p-6 rounded-full w-fit mx-auto">
                    <Construction className="w-12 h-12 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Task Management Coming Soon</h2>
                <p className="text-muted-foreground max-w-sm mx-auto">
                    Comprehensive task management for projects is currently under development.
                </p>
            </div>
        </PageWrapper>
    );
}
