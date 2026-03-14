"use client";

import { DocumentVault } from "@/components/hrm/DocumentVault";

export default function DocumentsPage() {
    return (
        <div className="space-y-4 p-4 lg:p-6 bg-gray-50/50 min-h-full">
            <h1 className="text-2xl font-bold text-gray-900 border-b pb-4 mb-4">My Documents</h1>
            <div className="pt-2">
                <DocumentVault />
            </div>
        </div>
    );
}
