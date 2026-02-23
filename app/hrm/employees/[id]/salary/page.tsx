"use client";

import { useState, useEffect } from 'react';
import { PageWrapper, CardWrapper } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { Loader2, Save, ArrowLeft, Calculator } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getUsers, updateUser } from '@/app/actions/hrm';
import Link from 'next/link';

export default function SalaryConfigurationPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [employee, setEmployee] = useState<any>(null);

    const [salary, setSalary] = useState({
        basic: 0,
        hra: 0,
        allowances: 0,
        deductions: {
            pf: 0,
            tax: 0,
            other: 0
        }
    });

    useEffect(() => {
        loadEmployee();
    }, []);

    const loadEmployee = async () => {
        try {
            // optimized: create specific action for single user if needed later
            const res = await getUsers();
            if (res.success && res.data) {
                const user = res.data.find((u: any) => u._id === params.id);
                if (user) {
                    setEmployee(user);
                    if (user.salaryStructure) {
                        setSalary(user.salaryStructure);
                    }
                } else {
                    toast.error("Employee not found");
                    router.push('/hrm/employees');
                }
            }
        } catch (error) {
            toast.error("Failed to load employee details");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // We need to create a specific action for updating salary structure 
            // or update the existing updateUser to handle nested objects if not supported
            // For now assuming we will add 'updateSalaryStructure' action or handle it in updateUser
            const res = await updateUser({
                id: params.id as string,
                salaryStructure: salary
            });

            if (res.success) {
                toast.success("Salary structure updated successfully");
            } else {
                toast.error(res.error || "Failed to update salary");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    const calculateTotal = () => {
        const gross = (salary.basic || 0) + (salary.hra || 0) + (salary.allowances || 0);
        const totalDeductions = (salary.deductions.pf || 0) + (salary.deductions.tax || 0) + (salary.deductions.other || 0);
        const net = gross - totalDeductions;
        return { gross, totalDeductions, net };
    };

    const handleChange = (field: string, subField: string | undefined, value: string) => {
        const numValue = parseFloat(value) || 0;
        if (subField) {
            setSalary(prev => ({
                ...prev,
                deductions: {
                    ...prev.deductions,
                    [subField]: numValue
                }
            }));
        } else {
            setSalary(prev => ({
                ...prev,
                [field]: numValue
            }));
        }
    };

    const totals = calculateTotal();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <PageWrapper className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/hrm/employees" className="p-2 hover:bg-background rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Salary Configuration</h1>
                    <p className="text-gray-500">Configure salary structure for {employee?.name}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Earnings Section */}
                <CardWrapper className="glass-card p-6 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 border-b pb-3 mb-4">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <Calculator className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Earnings</h3>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary (₹)</label>
                        <input
                            aria-label="Basic Salary"
                            type="number"
                            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={salary.basic}
                            onChange={(e) => handleChange('basic', undefined, e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">HRA (₹)</label>
                        <input
                            aria-label="HRA"
                            type="number"
                            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={salary.hra}
                            onChange={(e) => handleChange('hra', undefined, e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Special Allowances (₹)</label>
                        <input
                            aria-label="Allowances"
                            type="number"
                            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={salary.allowances}
                            onChange={(e) => handleChange('allowances', undefined, e.target.value)}
                        />
                    </div>

                    <div className="pt-4 border-t flex justify-between items-center">
                        <span className="font-medium text-gray-600">Gross Salary</span>
                        <span className="text-xl font-bold text-green-600">₹ {totals.gross.toLocaleString()}</span>
                    </div>
                </CardWrapper>

                {/* Deductions Section */}
                <CardWrapper delay={0.1} className="glass-card p-6 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 border-b pb-3 mb-4">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <Calculator className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Deductions</h3>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Provident Fund (PF) (₹)</label>
                        <input
                            type="number"
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-100 outline-none"
                            value={salary.deductions.pf}
                            onChange={(e) => setSalary({ ...salary, deductions: { ...salary.deductions, pf: Number(e.target.value) } })}
                            aria-label="Provident Fund"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Professional Tax (₹)</label>
                        <input
                            type="number"
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-100 outline-none"
                            value={salary.deductions.tax}
                            onChange={(e) => setSalary({ ...salary, deductions: { ...salary.deductions, tax: Number(e.target.value) } })}
                            aria-label="Professional Tax"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Other Deductions (₹)</label>
                        <input
                            type="number"
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-100 outline-none"
                            value={salary.deductions.other}
                            onChange={(e) => setSalary({ ...salary, deductions: { ...salary.deductions, other: Number(e.target.value) } })}
                            aria-label="Other Deductions"
                        />
                    </div>

                    <div className="pt-4 border-t flex justify-between items-center">
                        <span className="font-medium text-gray-600">Total Deductions</span>
                        <span className="text-xl font-bold text-red-600">₹ {totals.totalDeductions.toLocaleString()}</span>
                    </div>
                </CardWrapper>
            </div>

            {/* Summary Footer */}
            <CardWrapper delay={0.2} className="glass-card p-6 rounded-xl border border-gray-200 bg-background/50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Net Salary Payable</h2>
                    <p className="text-sm text-gray-500">Calculated as Gross Earnings - Total Deductions</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <span className="block text-xs text-gray-500 uppercase font-semibold">Net Pay</span>
                        <span className="text-3xl font-bold text-gray-900">₹ {totals.net.toLocaleString()}</span>
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="px-8 h-12 text-lg shadow-xl shadow-primary/20">
                        {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                        Save Configuration
                    </Button>
                </div>
            </CardWrapper>
        </PageWrapper>
    );
}
