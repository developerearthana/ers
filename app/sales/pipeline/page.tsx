"use client";

import PipelineBoard from "@/components/sales/PipelineBoard";
import { PageWrapper, CardWrapper } from "@/components/ui/page-wrapper";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PipelinePage() {
    return (
        <PageWrapper className="h-[calc(100vh-120px)] p-2 max-w-[1600px] mx-auto flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Sales Pipeline</h1>
                    <p className="text-muted-foreground mt-1">Visualize and manage your deal flow with drag-and-drop efficiency.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Import</Button>
                    <Button className="shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4 mr-2" />
                        New Deal
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <PipelineBoard />
            </div>
        </PageWrapper>
    );
}
