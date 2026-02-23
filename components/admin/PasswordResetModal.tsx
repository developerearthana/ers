"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { adminResetPassword } from "@/app/actions/hrm";
import { toast } from "sonner";
import { Loader2, KeyRound } from "lucide-react";

interface PasswordResetModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
}

export function PasswordResetModal({ isOpen, onClose, userId, userName }: PasswordResetModalProps) {
    const [password, setPassword] = useState("");
    const [isPending, setIsPending] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);

        const res = await adminResetPassword(userId, password);

        if (res.success) {
            toast.success("Password updated successfully");
            setPassword("");
            onClose();
        } else {
            toast.error(res.error || "Failed to reset password");
        }

        setIsPending(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-primary" />
                        Reset Password
                    </DialogTitle>
                    <DialogDescription>
                        Set a new password for <strong>{userName}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleReset} className="space-y-4 mt-2">
                    <div>
                        <input
                            type="text"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
                            required
                            minLength={6}
                        />
                        <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters.</p>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-white rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
                        >
                            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Reset Password
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
