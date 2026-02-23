"use client";

import { PageWrapper } from '@/components/ui/page-wrapper';
import { VerificationQueue } from '@/components/accounts/VerificationQueue';
import { ShieldCheck } from 'lucide-react';

export default function VerificationPage() {
    return (
        <PageWrapper className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
                    <p className="text-gray-500">Review and approve pending expense claims.</p>
                </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-600">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 text-sm">Smart Verification Active</h4>
                    <p className="text-xs text-gray-600">
                        System automatically flags high-value claims (&gt;₹10,000) and verifies scan matches.
                    </p>
                </div>
            </div>

            <VerificationQueue />
        </PageWrapper>
    );
}
