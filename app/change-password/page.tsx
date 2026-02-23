'use client';

import { useState, useTransition } from 'react';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { changePassword } from '@/app/actions/user-profile';
import { toast } from 'sonner';
import { Loader2, KeyRound, Check, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        startTransition(async () => {
            const res = await changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            if (res.success) {
                toast.success("Password updated successfully");
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                router.push('/');
            } else {
                toast.error(res.error || "Failed to update password");
            }
        });
    };

    return (
        <PageWrapper>
            <div className="max-w-md mx-auto mt-12 mb-12">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                        <KeyRound className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
                    <p className="text-gray-500 mt-2">Update your password to keep your account secure.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700" htmlFor="current">Current Password</label>
                            <input
                                type="password"
                                id="current"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                value={formData.currentPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700" htmlFor="new">New Password</label>
                            <input
                                type="password"
                                id="new"
                                required
                                minLength={6}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                value={formData.newPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                            />
                            <p className="text-xs text-gray-400">Must be at least 6 characters long</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700" htmlFor="confirm">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirm"
                                required
                                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                                        ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
                                        : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
                                    }`}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            />
                            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Passwords do not match
                                </p>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-primary text-white font-medium py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Update Password
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </PageWrapper>
    );
}
