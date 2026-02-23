"use client";

import { PageWrapper } from '@/components/ui/page-wrapper';
import { DocumentVault } from '@/components/hrm/DocumentVault';

export default function DocumentsPage() {
    return (
        <PageWrapper>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
                <p className="text-gray-500">Manage your employment contracts, IDs, and certifications.</p>
            </div>

            <div className="glass-card p-6 rounded-xl border border-gray-200/60 bg-white/40 shadow-sm">
                <DocumentVault />
            </div>
        </PageWrapper>
    );
}
