"use client";

import { PageWrapper } from '@/components/ui/page-wrapper';
import { PayslipViewer } from '@/components/hrm/PayslipViewer';
import { FileText, History } from 'lucide-react';
import { getPayslips } from '@/app/actions/hrm';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function PayrollPage() {
    const [payslips, setPayslips] = useState<any[]>([]);
    const [selectedSlip, setSelectedSlip] = useState<any>(null);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        loadPayslips();
    }, []);

    const loadPayslips = async () => {
        const res = await getPayslips();
        if (res.success && res.data) {
            setPayslips(res.data);
            if (res.data.length > 0) {
                setSelectedSlip(res.data[0]);
            }
        } else {
            // Optional: toast.error("Failed to load payslips");
        }
    };

    const handleGenerate = async () => {
        const confirm = window.confirm("Are you sure you want to generate payroll for the current month?");
        if (!confirm) return;

        setGenerating(true);
        const date = new Date();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();

        try {
            // Import dynamically here or at top
            const { generateMonthlyPayroll } = await import('@/app/actions/hrm');
            const res = await generateMonthlyPayroll(month, year);
            if (res.success) {
                toast.success(`Payroll generated for ${month} ${year}`);
                loadPayslips();
            } else {
                toast.error(res.error || "Failed to generate payroll");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <PageWrapper className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payroll & Salary</h1>
                    <p className="text-gray-500">View and download your monthly salary slips.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="flex items-center gap-2 text-sm font-medium text-white bg-white hover:bg-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-gray-200"
                    >
                        {generating ? <History className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        Generate Payroll
                    </button>
                    <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-lg">
                        <History className="w-4 h-4" /> History
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Sidebar List */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Recent Payslips</h3>
                    {payslips.length === 0 && <p className="text-xs text-gray-500">No payslips found.</p>}
                    {payslips.map((slip, i) => (
                        <div
                            key={i}
                            onClick={() => setSelectedSlip(slip)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedSlip?._id === slip._id
                                ? "bg-white border-gray-900 shadow-md ring-1 ring-gray-900"
                                : "bg-background border-gray-100 hover:bg-white hover:border-gray-200"
                                }`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className={`font-bold ${selectedSlip?._id === slip._id ? "text-gray-900" : "text-gray-600"}`}>{slip.month ?? '—'}</span>
                                <FileText className={`w-4 h-4 ${selectedSlip?._id === slip._id ? "text-gray-900" : "text-gray-400"}`} />
                            </div>
                            <div className="flex justify-between mt-2">
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    {slip.status ?? 'N/A'}
                                </span>
                                <span className="text-xs font-mono font-medium text-gray-500">
                                    ₹{(slip.netPay ?? 0).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Viewer */}
                <div className="lg:col-span-3">
                    <PayslipViewer data={selectedSlip} />
                </div>
            </div>
        </PageWrapper>
    );
}
