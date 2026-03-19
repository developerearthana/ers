"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Upload, Shield, CheckCircle, Trash2, Loader2, Download, FileText, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardWrapper } from '@/components/ui/page-wrapper';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { getHRMDocuments, uploadHRMDocument, deleteHRMDocument, getVaultUsers } from '@/app/actions/hrm-documents';
import { uploadFile } from '@/app/actions/upload';
import { toast } from 'sonner';

interface UserItem {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface DocItem {
    _id: string;
    name: string;
    type: string;
    category?: string;
    createdAt: string;
    size: number;
    url: string;
    uploadedBy?: string;
}

const CATEGORIES = ['All', 'Identity', 'Contract', 'Certification', 'Other'];

const CATEGORY_COLORS: Record<string, string> = {
    Identity: 'bg-blue-50 text-blue-700 border-blue-200',
    Contract: 'bg-purple-50 text-purple-700 border-purple-200',
    Certification: 'bg-amber-50 text-amber-700 border-amber-200',
    Other: 'bg-gray-50 text-gray-700 border-gray-200',
};

export function DocumentVault() {
    const { data: session } = useSession();
    const userRole = session?.user?.role?.toLowerCase() || '';
    const isAdminOrHR =
        userRole.includes('admin') ||
        userRole.includes('manager') ||
        userRole.includes('hr');

    const [filter, setFilter] = useState<string>('All');
    const [docs, setDocs] = useState<DocItem[]>([]);
    const [users, setUsers] = useState<UserItem[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('ALL');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadCategory, setUploadCategory] = useState('Contract');
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [previewFile, setPreviewFile] = useState<DocItem | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const loadDocs = useCallback(async () => {
        if (!session?.user?.id) return;
        setLoading(true);
        try {
            const [res, usersData] = await Promise.all([
                getHRMDocuments(),
                isAdminOrHR ? getVaultUsers() : Promise.resolve(null)
            ]);
            if (res.success && res.data) {
                setDocs(res.data);
            } else {
                setDocs([]);
            }
            if (isAdminOrHR && usersData?.success && usersData.data) {
                setUsers(usersData.data);
            }
        } catch (e) {
            console.error('Failed to load docs', e);
            setDocs([]);
        } finally {
            setLoading(false);
        }
    }, [refreshKey, isAdminOrHR, session?.user?.id]);

    useEffect(() => {
        loadDocs();
    }, [loadDocs]);

    const triggerRefresh = () => setRefreshKey(k => k + 1);

    const MAX_FILE_SIZE_MB = 10;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    // Step 1: user picks a file → validate size → show category picker
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Enforce 10 MB limit
        if (file.size > MAX_FILE_SIZE_BYTES) {
            toast.error(
                `File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`
            );
            e.target.value = '';
            return;
        }

        setPendingFile(file);
        setShowCategoryPicker(true);
        // Reset input so the same file can be re-selected later
        e.target.value = '';
    };

    // Step 2: user confirms category → actually upload
    const handleUploadConfirm = async () => {
        if (!pendingFile) return;
        setShowCategoryPicker(false);
        setUploading(true);

        try {
            // 1. Send file to server to write to disk
            const formData = new FormData();
            formData.append('file', pendingFile);
            const uploadRes = await uploadFile(formData);

            if (!uploadRes.url || uploadRes.error) {
                toast.error(uploadRes.error || 'File upload failed');
                return;
            }

            // 2. Save metadata in MongoDB
            const res = await uploadHRMDocument({
                name: pendingFile.name,
                url: uploadRes.url,
                type: uploadCategory,
                size: pendingFile.size,
                category: uploadCategory,
            });

            if (res.success) {
                toast.success(`"${pendingFile.name}" uploaded ✅`);
                // Force a fresh fetch from DB
                triggerRefresh();
            } else {
                toast.error(res.error || 'Could not save document metadata');
            }
        } catch (err) {
            console.error(err);
            toast.error('Upload failed unexpectedly');
        } finally {
            setUploading(false);
            setPendingFile(null);
        }
    };

    const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            const res = await deleteHRMDocument(id);
            if (res.success) {
                toast.success('Document deleted');
                triggerRefresh();
            } else {
                toast.error(res.error || 'Deletion failed');
            }
        } catch {
            toast.error('An error occurred');
        }
    };

    const handleDownload = (doc: DocItem, e: React.MouseEvent) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = doc.url;
        link.download = doc.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Downloading: ${doc.name}`);
    };

    const filteredDocs =
        (filter === 'All' ? docs : docs.filter(d => (d.type || d.category) === filter))
        .filter(d => {
            if (!isAdminOrHR) {
                return d.uploadedBy === session?.user?.id;
            }
            if (selectedUserId === 'ALL') return true;
            return d.uploadedBy === selectedUserId;
        });

    return (
        <div className="space-y-6">
            {/* ─── Category Picker Modal ─── */}
            {showCategoryPicker && pendingFile && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Select Document Category</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            File: <span className="font-medium text-gray-700">{pendingFile.name}</span>
                        </p>
                        <div className="grid grid-cols-2 gap-2 mb-5">
                            {CATEGORIES.filter(c => c !== 'All').map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setUploadCategory(cat)}
                                    className={cn(
                                        'px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all',
                                        uploadCategory === cat
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowCategoryPicker(false); setPendingFile(null); }}
                                className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUploadConfirm}
                                className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
                            >
                                Upload Document
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Header / Filter / Upload ─── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Secure Document Vault</h3>
                        <p className="text-sm text-gray-500">
                            {isAdminOrHR
                                ? 'Upload and manage all employee documents'
                                : 'View and download your documents'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Category filter tabs */}
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={cn(
                                'px-3 py-1.5 text-xs font-bold rounded-lg transition-all',
                                filter === cat
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            )}
                        >
                            {cat}
                        </button>
                    ))}

                    {/* Upload */}
                    <div className="flex items-center gap-2 ml-2">
                            <label
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg shadow-lg cursor-pointer transition-colors',
                                    uploading
                                        ? 'bg-emerald-400 text-white cursor-wait'
                                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                                )}
                            >
                                {uploading ? (
                                    <><Loader2 className="w-3 h-3 animate-spin" /> Uploading…</>
                                ) : (
                                    <><Upload className="w-3 h-3" /> Upload Document</>
                                )}
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    disabled={uploading}
                                />
                            </label>
                            <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">Max 10 MB</span>
                        </div>
                </div>
            </div>

            {/* ─── Document Grid and Sidebar ─── */}
            <div className={isAdminOrHR ? "grid grid-cols-1 md:grid-cols-4 gap-6" : ""}>
                {isAdminOrHR && (
                    <div className="md:col-span-1 space-y-2">
                        <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                            <h4 className="text-sm font-bold text-gray-900 mb-3">Employees</h4>
                            <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                                <button
                                    onClick={() => setSelectedUserId('ALL')}
                                    className={cn(
                                        "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                                        selectedUserId === 'ALL' ? "bg-emerald-50 text-emerald-700 font-bold" : "text-gray-600 hover:bg-gray-50 font-medium"
                                    )}
                                >
                                    All Employees
                                </button>
                                {users.map((u: any) => (
                                    <button
                                        key={u._id}
                                        onClick={() => setSelectedUserId(u._id)}
                                        className={cn(
                                            "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors truncate",
                                            selectedUserId === u._id ? "bg-emerald-50 text-emerald-700 font-bold" : "text-gray-600 hover:bg-gray-50"
                                        )}
                                        title={u.name}
                                    >
                                        {u.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                <div className={isAdminOrHR ? "md:col-span-3" : "w-full"}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div key="loading" className="col-span-3 flex flex-col items-center justify-center py-16 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                            <p className="text-sm text-gray-400">Loading documents…</p>
                        </div>
                    ) : filteredDocs.length === 0 ? (
                        <div key="empty" className="col-span-3 flex flex-col items-center justify-center py-16 gap-3 border-2 border-dashed border-gray-200 rounded-2xl">
                            <Shield className="w-12 h-12 text-gray-200" />
                            <p className="font-semibold text-gray-500">No documents found</p>
                            <p className="text-sm text-gray-400">
                                {isAdminOrHR
                                    ? 'Upload the first document using the button above.'
                                    : 'No documents have been shared with you yet.'}
                            </p>
                        </div>
                    ) : (
                        filteredDocs.map((doc, i) => (
                            <CardWrapper key={doc._id} delay={i * 0.04}>
                                <motion.div
                                    layout
                                    className="group relative bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all hover:border-emerald-200"
                                    onClick={() => setPreviewFile(doc)}
                                >
                                    {/* Top row */}
                                    <div className="flex items-start mb-3 relative">
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex flex-shrink-0 items-center justify-center text-gray-500 font-bold text-[10px] group-hover:border-emerald-300 transition-colors uppercase">
                                                {doc.url.split('.').pop()?.substring(0, 4) || 'FILE'}
                                            </div>
                                            <div className="min-w-0 flex-1 pr-4">
                                                <h4 className="text-sm font-bold text-gray-900 truncate" title={doc.name}>
                                                    {doc.name}
                                                </h4>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {(doc.size / 1024).toFixed(0)} KB
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action buttons — visible on hover */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 absolute -top-2 -right-2 bg-white/95 backdrop-blur-sm shadow-sm border border-gray-100 p-1 rounded-lg z-10">
                                            <button
                                                aria-label="View document"
                                                onClick={e => { e.stopPropagation(); setPreviewFile(doc); }}
                                                className="p-1.5 rounded-md text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                title="View"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                aria-label="Download document"
                                                onClick={e => handleDownload(doc, e)}
                                                className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            {(isAdminOrHR || doc.uploadedBy === session?.user?.id) && (
                                                <button
                                                    aria-label="Delete document"
                                                    onClick={e => handleDelete(doc._id, doc.name, e)}
                                                    className="p-1.5 rounded-md text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Category badge */}
                                    <span className={cn(
                                        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border',
                                        CATEGORY_COLORS[doc.type] || CATEGORY_COLORS.Other
                                    )}>
                                        {doc.type || 'Document'}
                                    </span>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t border-gray-100">
                                        <span className="text-gray-400">
                                            {format(new Date(doc.createdAt), 'dd MMM yyyy')}
                                        </span>
                                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                                            <CheckCircle className="w-3 h-3" /> Verified
                                        </span>
                                    </div>
                                </motion.div>
                            </CardWrapper>
                        ))
                    )}
                </AnimatePresence>
                    </div>
                </div>
            </div>

            <Dialog open={!!previewFile} onOpenChange={(o) => !o && setPreviewFile(null)}>
                <DialogContent className="glass-card max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center bg-background">
                        <h3 className="font-bold truncate max-w-[60%]">{previewFile?.name}</h3>
                        <div className="flex items-center gap-3">
                            <a href={previewFile?.url} download className="text-primary hover:underline text-sm flex items-center gap-1"><Download className="w-4 h-4" /> Download</a>
                            <button className="text-sm font-medium hover:text-gray-900 border p-1 border-gray-100 rounded-md px-3" onClick={() => setPreviewFile(null)}>Close</button>
                        </div>
                    </div>
                    <div className="flex-1 bg-white p-4 overflow-hidden flex items-center justify-center">
                        {previewFile?.url.includes('data:image/') ? (
                            <img src={previewFile?.url} alt={previewFile?.name} className="max-w-full max-h-full object-contain shadow-lg" />
                        ) : (
                            <iframe src={previewFile?.url} className="w-full h-full rounded shadow-lg bg-gray-50 border-none" title={previewFile?.name} />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
