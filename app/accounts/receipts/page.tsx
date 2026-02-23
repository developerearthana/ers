"use client";

import { PageWrapper } from '@/components/ui/page-wrapper';
import { ReceiptScanner } from '@/components/accounts/ReceiptScanner';
import { Camera, History, AlertCircle } from 'lucide-react';

export default function ReceiptScanningPage() {
    return (
        <PageWrapper className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Intelligent Receipt Capture</h1>
                    <p className="text-gray-500">Scan invoices and expenses using AI OCR.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 hover:text-gray-900 text-sm font-medium border rounded-lg shadow-sm">
                        <History className="w-4 h-4" /> Scan History
                    </button>
                </div>
            </div>

            <div className="bg-white border border-border p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-blue-700 text-sm">AI Tip</h4>
                    <p className="text-sm text-blue-600/80">
                        Ensure the receipt is well-lit and placed on a dark background for best OCR results.
                        Handwritten totals are currently in beta.
                    </p>
                </div>
            </div>

            <ReceiptScanner />
        </PageWrapper>
    );
}
