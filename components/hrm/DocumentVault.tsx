"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Eye, Upload, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardWrapper } from '@/components/ui/page-wrapper';
import { format } from 'date-fns';

interface DocItem {
    id: number;
    name: string;
    type: 'PDF' | 'JPG' | 'PNG';
    category: 'Identity' | 'Contract' | 'Certification';
    uploadDate: Date;
    expiryDate?: Date;
    status: 'Valid' | 'Expiring' | 'Expired';
    size: string;
}

const MOCK_DOCS: DocItem[] = [
    { id: 1, name: "Employment Contract 2026", type: "PDF", category: "Contract", uploadDate: new Date(2025, 11, 15), expiryDate: new Date(2027, 11, 15), status: "Valid", size: "2.4 MB" },
    { id: 2, name: "Passport Front", type: "JPG", category: "Identity", uploadDate: new Date(2024, 5, 20), expiryDate: new Date(2026, 2, 10), status: "Expiring", size: "1.1 MB" },
    { id: 3, name: "Visa Document", type: "PDF", category: "Identity", uploadDate: new Date(2024, 6, 1), expiryDate: new Date(2025, 12, 1), status: "Expired", size: "850 KB" },
    { id: 4, name: "React Certification", type: "PNG", category: "Certification", uploadDate: new Date(2025, 2, 10), status: "Valid", size: "3.2 MB" },
];

export function DocumentVault() {
    const [filter, setFilter] = useState<string>('All');
    const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);

    const filteredDocs = filter === 'All' ? MOCK_DOCS : MOCK_DOCS.filter(d => d.category === filter);

    return (
        <div className="space-y-6">
            {/* Header / Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Secure Document Vault</h3>
                        <p className="text-sm text-gray-500">Encrypted storage for verifying identity & contracts.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {['All', 'Identity', 'Contract', 'Certification'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={cn(
                                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                                filter === cat
                                    ? "bg-white text-white shadow-md"
                                    : "bg-white text-gray-600 border border-gray-200 hover:bg-background"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 ml-2">
                        <Upload className="w-3 h-3" /> Upload New
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode='popLayout'>
                    {filteredDocs.map((doc, i) => (
                        <CardWrapper key={doc.id} delay={i * 0.05}>
                            <motion.div
                                layout
                                onClick={() => setSelectedDoc(doc)}
                                className={cn(
                                    "relative group bg-white border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md",
                                    doc.status === 'Expiring' ? "border-amber-200 bg-amber-50/30" :
                                        doc.status === 'Expired' ? "border-red-200 bg-red-50/30" : "border-gray-100"
                                )}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-gray-500 font-bold text-xs border border-gray-200 group-hover:bg-white group-hover:border-primary/30 transition-colors">
                                            {doc.type}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{doc.name}</h4>
                                            <p className="text-xs text-gray-500">{doc.category} • {doc.size}</p>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button aria-label="View Document" className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Status Footer */}
                                <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100/50">
                                    <span className="text-gray-400">Uploaded {format(doc.uploadDate, 'MMM d, yyyy')}</span>

                                    {doc.status === 'Valid' && (
                                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                                            <CheckCircle className="w-3 h-3" /> Valid
                                        </span>
                                    )}
                                    {doc.status === 'Expiring' && (
                                        <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                                            <Clock className="w-3 h-3" /> Expiring Soon
                                        </span>
                                    )}
                                    {doc.status === 'Expired' && (
                                        <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                                            <AlertTriangle className="w-3 h-3" /> Expired
                                        </span>
                                    )}
                                </div>

                                {doc.expiryDate && (
                                    <div className="absolute top-0 right-0 p-1">
                                        <div className={cn("w-2 h-2 rounded-full",
                                            doc.status === 'Valid' ? "bg-emerald-500" :
                                                doc.status === 'Expiring' ? "animate-pulse bg-amber-500" : "bg-red-500"
                                        )} />
                                    </div>
                                )}
                            </motion.div>
                        </CardWrapper>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

