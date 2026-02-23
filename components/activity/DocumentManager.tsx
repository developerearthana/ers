"use client";

import { useState, useEffect } from 'react';
import { FileText, Download, MoreVertical, Folder, UploadCloud, Trash2, File, FileImage, FileCode, Plus, Loader2, LayoutGrid, List, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getContents, uploadFile, createFolder, deleteItem, renameFolder } from '@/app/actions/activity/documents';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Edit2 } from 'lucide-react';

interface DocItem {
    _id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    updatedAt: string;
}

interface FolderItem {
    _id: string;
    name: string;
    parentId?: string;
}

export default function DocumentManager() {
    const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
    const [documents, setDocuments] = useState<DocItem[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [previewFile, setPreviewFile] = useState<DocItem | null>(null);
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [folderStack, setFolderStack] = useState<{ id: string | undefined, name: string }[]>([{ id: undefined, name: 'Home' }]);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [renameData, setRenameData] = useState<{ id: string, name: string } | null>(null);

    useEffect(() => {
        const savedView = localStorage.getItem('docViewMode');
        if (savedView === 'grid' || savedView === 'list') setViewMode(savedView);
    }, []);

    const toggleView = (mode: 'list' | 'grid') => {
        setViewMode(mode);
        localStorage.setItem('docViewMode', mode);
    };

    const fetchContents = async (folderId?: string) => {
        setLoading(true);
        const res = await getContents(folderId);
        if (res.success && res.data) {
            setDocuments(res.data.documents);
            setFolders(res.data.folders);
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchContents(currentFolderId);
    }, [currentFolderId]);

    const handleNavigate = (folderId: string | undefined, folderName: string) => {
        if (folderId === undefined) {
            setFolderStack([{ id: undefined, name: 'Home' }]);
        } else {
            // Check if going back or deep
            const idx = folderStack.findIndex(f => f.id === folderId);
            if (idx !== -1) {
                setFolderStack(folderStack.slice(0, idx + 1));
            } else {
                setFolderStack([...folderStack, { id: folderId, name: folderName }]);
            }
        }
        setCurrentFolderId(folderId);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        if (currentFolderId) formData.append('folderId', currentFolderId);

        const toastId = toast.loading('Uploading...');
        try {
            const res = await uploadFile(formData);
            if (res.success) {
                toast.success('File uploaded', { id: toastId });
                fetchContents(currentFolderId);
            } else {
                toast.error(res.error, { id: toastId });
            }
        } catch (error) {
            toast.error('Upload failed', { id: toastId });
        }
        // Reset input
        e.target.value = '';
    };

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        try {
            const res = await createFolder(newFolderName, currentFolderId);
            if (res.success) {
                toast.success('Folder created');
                setNewFolderName("");
                setIsNewFolderOpen(false);
                fetchContents(currentFolderId);
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error('Failed to create folder');
        }
    };

    const handleRenameClick = (id: string, name: string) => {
        setRenameData({ id, name });
        setIsRenameOpen(true);
    };

    const handleRenameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!renameData || !renameData.name.trim()) return;

        try {
            const res = await renameFolder(renameData.id, renameData.name);
            if (res.success) {
                toast.success('Renamed successfully');
                setIsRenameOpen(false);
                setRenameData(null);
                fetchContents(currentFolderId);
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error('Rename failed');
        }
    };

    const handleDelete = async (id: string, type: 'file' | 'folder') => {
        if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

        try {
            const res = await deleteItem(id, type);
            if (res.success) {
                toast.success('Deleted successfully');
                fetchContents(currentFolderId);
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
        if (mimeType.includes('image')) return <FileImage className="w-5 h-5 text-purple-500" />;
        if (mimeType.includes('zip') || mimeType.includes('compressed')) return <Folder className="w-5 h-5 text-yellow-500" />;
        return <File className="w-5 h-5 text-gray-400" />;
    };

    return (
        <div className="glass-card rounded-xl p-6 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 overflow-x-auto">
                    {folderStack.map((folder, idx) => (
                        <div key={folder.id || 'root'} className="flex items-center">
                            {idx > 0 && <span className="text-gray-400 mx-2">/</span>}
                            <button
                                onClick={() => handleNavigate(folder.id, folder.name)}
                                className={cn(
                                    "font-medium text-sm hover:text-primary transition-colors",
                                    idx === folderStack.length - 1 ? "text-gray-900 font-bold" : "text-gray-500"
                                )}
                            >
                                {folder.name}
                            </button>
                        </div>
                    ))}

                </div>
                <div className="flex gap-2 items-center">
                    <div className="bg-white p-1 rounded-lg flex gap-1 mr-2">
                        <button onClick={() => toggleView('list')} title="List View" className={cn("p-1.5 rounded-md transition-colors", viewMode === 'list' ? "bg-white shadow-sm text-primary" : "text-gray-500 hover:text-gray-900")}><List className="w-4 h-4" /></button>
                        <button onClick={() => toggleView('grid')} title="Grid View" className={cn("p-1.5 rounded-md transition-colors", viewMode === 'grid' ? "bg-white shadow-sm text-primary" : "text-gray-500 hover:text-gray-900")}><LayoutGrid className="w-4 h-4" /></button>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsNewFolderOpen(true)} className="gap-2">
                        <Folder className="w-4 h-4" /> New Folder
                    </Button>
                    <label htmlFor="file-upload" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium cursor-pointer h-9">
                        <UploadCloud className="w-4 h-4" />
                        Upload
                        <input id="file-upload" type="file" className="hidden" onChange={handleUpload} />
                    </label>
                </div>
            </div>

            <div className="flex-1 bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                )}

                {viewMode === 'list' ? (
                    <div className="overflow-y-auto flex-1 overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-background border-b sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Size</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {/* Folders first */}
                                {folders.map(folder => (
                                    <tr key={folder._id} className="hover:bg-background transition-colors cursor-pointer group" onClick={() => handleNavigate(folder._id, folder.name)}>
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <Folder className="w-5 h-5 text-yellow-500" />
                                            <span className="font-medium text-gray-900">{folder.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">-</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">-</td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleRenameClick(folder._id, folder.name)} title="Rename Folder" className="text-gray-400 hover:text-blue-500 p-1">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(folder._id, 'folder')} title="Delete Folder" className="text-gray-400 hover:text-red-500 p-1">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {documents.map(doc => (
                                    <tr key={doc._id} className="hover:bg-background transition-colors group">
                                        <td className="px-6 py-4 flex items-center gap-3 cursor-pointer hover:text-blue-600" onClick={() => setPreviewFile(doc)}>
                                            {getFileIcon(doc.type)}
                                            <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{doc.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{formatSize(doc.size)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(doc.updatedAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setPreviewFile(doc)} title="Preview" className="text-gray-400 hover:text-blue-500 p-1"><Eye className="w-4 h-4" /></button>
                                                <a href={doc.url} download target="_blank" title="Download File" className="text-gray-400 hover:text-primary p-1"><Download className="w-4 h-4" /></a>
                                                <button onClick={() => handleDelete(doc._id, 'file')} title="Delete File" className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {folders.length === 0 && documents.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-12 text-gray-400">
                                            <Folder className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p>This folder is empty</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {folders.map(folder => (
                                <div key={folder._id} onClick={() => handleNavigate(folder._id, folder.name)} className="group p-4 rounded-xl border border-gray-100 bg-background/50 hover:bg-white hover:border-border cursor-pointer transition-all flex flex-col items-center text-center gap-3 relative">
                                    <Folder className="w-12 h-12 text-yellow-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-gray-700 truncate w-full">{folder.name}</span>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => handleRenameClick(folder._id, folder.name)} title="Rename Folder" className="p-1 hover:bg-white rounded-full text-gray-400 hover:text-blue-500"><Edit2 className="w-3 h-3" /></button>
                                        <button onClick={() => handleDelete(folder._id, 'folder')} title="Delete Folder" className="p-1 hover:bg-white rounded-full text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            ))}
                            {documents.map(doc => (
                                <div key={doc._id} onClick={() => setPreviewFile(doc)} className="group p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all flex flex-col items-center text-center gap-3 relative bg-white cursor-pointer hover:border-blue-200">
                                    <div className="w-12 h-12 flex items-center justify-center bg-background rounded-lg group-hover:scale-110 transition-transform">
                                        {getFileIcon(doc.type)}
                                    </div>
                                    <div className="w-full">
                                        <p className="text-sm font-medium text-gray-900 truncate w-full" title={doc.name}>{doc.name}</p>
                                        <p className="text-[10px] text-gray-400">{formatSize(doc.size)}</p>
                                    </div>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={(e) => { e.stopPropagation(); setPreviewFile(doc); }} title="Preview File" className="p-1 hover:bg-white rounded-full text-gray-400 hover:text-blue-500"><Eye className="w-3 h-3" /></button>
                                        <a href={doc.url} download target="_blank" title="Download File" onClick={(e) => e.stopPropagation()} className="p-1 hover:bg-white rounded-full text-gray-400 hover:text-green-500"><Download className="w-3 h-3" /></a>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(doc._id, 'file'); }} title="Delete File" className="p-1 hover:bg-white rounded-full text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {folders.length === 0 && documents.length === 0 && !loading && (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <Folder className="w-16 h-16 mb-4 opacity-20" />
                                <p>Empty Folder</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
                <DialogContent className="glass-card sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateFolder}>
                        <div className="grid gap-4 py-3">
                            <Input
                                placeholder="Folder Name"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setIsNewFolderOpen(false)}>Cancel</Button>
                            <Button type="submit" size="sm">Create</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>


            <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
                <DialogContent className="glass-card sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Rename Folder</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleRenameSubmit}>
                        <div className="grid gap-4 py-3">
                            <Input
                                placeholder="Folder Name"
                                value={renameData?.name || ''}
                                onChange={(e) => setRenameData(prev => prev ? { ...prev, name: e.target.value } : null)}
                                autoFocus
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setIsRenameOpen(false)}>Cancel</Button>
                            <Button type="submit" size="sm">Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!previewFile} onOpenChange={(o) => !o && setPreviewFile(null)}>
                <DialogContent className="glass-card max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center bg-background">
                        <h3 className="font-bold truncate max-w-[60%]">{previewFile?.name}</h3>
                        <div className="flex items-center gap-3">
                            <a href={previewFile?.url} download className="text-primary hover:underline text-sm flex items-center gap-1"><Download className="w-4 h-4" /> Download</a>
                            <Button variant="ghost" size="sm" onClick={() => setPreviewFile(null)}>Close</Button>
                        </div>
                    </div>
                    <div className="flex-1 bg-white p-4 overflow-hidden flex items-center justify-center">
                        {previewFile?.type.includes('image') ? (
                            <img src={previewFile?.url} alt={previewFile?.name} className="max-w-full max-h-full object-contain shadow-lg" />
                        ) : previewFile?.type.includes('pdf') ? (
                            <iframe src={previewFile?.url} className="w-full h-full rounded shadow-lg" title={previewFile?.name} />
                        ) : (
                            <div className="text-center text-gray-500">
                                <File className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p>Preview not available for this file type</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}

