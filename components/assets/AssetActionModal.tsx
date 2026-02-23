"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { assignAsset, returnAsset } from '@/app/actions/asset';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface AssetActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'assign' | 'return';
    asset: any | null; // Can be null for Quick Assign
    users?: any[];
    availableAssets?: any[]; // For Quick Assign
}

export function AssetActionModal({ isOpen, onClose, type, asset: initialAsset, users = [], availableAssets = [] }: AssetActionModalProps) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState<string>(initialAsset?.id || "");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const assetId = initialAsset?.id || selectedAssetId;

        if (!assetId || !session?.user) {
            toast.error("Please select an asset");
            return;
        }

        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const currentUserId = session.user.id || "";

        let res;
        if (type === 'assign') {
            res = await assignAsset({
                assetId,
                userId: formData.get('userId') as string,
                assignedBy: currentUserId,
                notes: (formData.get('notes') as string) || "",
            });
        } else {
            res = await returnAsset({
                assetId,
                assignedBy: currentUserId,
                condition: (formData.get('condition') as string) || "Good",
                notes: (formData.get('notes') as string) || "",
            });
        }

        setLoading(false);

        if (res.success) {
            toast.success(`Asset ${type === 'assign' ? 'assigned' : 'returned'} successfully`);
            onClose();
        } else {
            toast.error(res.error || "Action failed");
        }
    };

    const assetName = initialAsset ? initialAsset.name : 'Asset';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{type === 'assign' ? 'Assign' : 'Return'} {initialAsset ? assetName : 'Asset'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* If no asset pre-selected, show dropdown */}
                    {!initialAsset && type === 'assign' && (
                        <div>
                            <label className="text-sm font-medium">Select Asset</label>
                            <select
                                name="assetId"
                                className="w-full p-2 border rounded-md"
                                value={selectedAssetId}
                                onChange={(e) => setSelectedAssetId(e.target.value)}
                                required
                                aria-label="Select Asset"
                            >
                                <option value="">Select Available Asset...</option>
                                {availableAssets.map(a => (
                                    <option key={a.id} value={a.id}>{a.name} ({a.category}) - {a.serialNo || 'No Serial'}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {type === 'assign' ? (
                        <div>
                            <label className="text-sm font-medium">Assign To</label>
                            <select name="userId" required className="w-full p-2 border rounded-md" aria-label="Assign To">
                                <option value="">Select Employee...</option>
                                {users.map(u => (
                                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label className="text-sm font-medium">Condition on Return</label>
                            <select name="condition" required className="w-full p-2 border rounded-md" aria-label="Condition on Return">
                                <option value="Good">Good</option>
                                <option value="Fair">Fair</option>
                                <option value="Damaged">Damaged</option>
                                <option value="Needs Repair">Needs Repair</option>
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="text-sm font-medium">Notes</label>
                        <textarea name="notes" className="w-full p-2 border rounded-md h-24" placeholder="Optional notes..." />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Confirm {type === 'assign' ? 'Assignment' : 'Return'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
