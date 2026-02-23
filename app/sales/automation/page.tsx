"use client";

import { PageWrapper } from '@/components/ui/page-wrapper';
import { AutomationBuilder } from '@/components/crm/AutomationBuilder';
import { VoiceInput } from '@/components/crm/VoiceInput';

export default function AutomationPage() {
    return (
        <PageWrapper className="space-y-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">CRM Intelligence & Inputs</h1>
                <p className="text-gray-500">Manage automation rules and test AI input methods.</p>
            </div>

            <AutomationBuilder />

            {/* Demo Section for Voice Input */}
            <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">AI Input Playground</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <VoiceInput />
                    <div className="p-4 bg-background rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                        More AI inputs coming soon...
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}
