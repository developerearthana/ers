"use client";

import Link from 'next/link';
import { Lock, FileText, ArrowRight, Info, Phone } from 'lucide-react';

export default function GuestDashboard() {
    return (
        <div className="space-y-6">
            <div className="bg-white text-white p-8 rounded-2xl shadow-lg text-center">
                <h1 className="text-3xl font-bold mb-2">Welcome to Smart Brains Earthana</h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    You are currently viewing this portal as a <strong>Guest / External Viewer</strong>.
                    Access is restricted to public resources only. To access application modules, please sign in with an authorized account.
                </p>
                <div className="mt-6 flex justify-center gap-4">
                    <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors">
                        Sign In
                    </button>
                    <button className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors">
                        Contact Support
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:border-indigo-200 transition-colors group">
                    <div className="p-3 bg-white text-blue-600 rounded-lg w-fit mb-4">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Company Policies</h3>
                    <p className="text-gray-500 mb-4 text-sm">Read our standard operating procedures, HR policies, and code of conduct.</p>
                    <Link href="#" className="flex items-center text-blue-600 font-medium text-sm group-hover:underline">
                        Read Policies <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:border-indigo-200 transition-colors group">
                    <div className="p-3 bg-white text-green-600 rounded-lg w-fit mb-4">
                        <Info className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">About Earthana</h3>
                    <p className="text-gray-500 mb-4 text-sm">Learn about the system capabilities, version history, and upcoming roadmap.</p>
                    <Link href="#" className="flex items-center text-green-600 font-medium text-sm group-hover:underline">
                        View Documentation <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:border-indigo-200 transition-colors group">
                    <div className="p-3 bg-white text-orange-600 rounded-lg w-fit mb-4">
                        <Phone className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Contact HR</h3>
                    <p className="text-gray-500 mb-4 text-sm">Have a query or need access? Reach out to the HR department administration.</p>
                    <Link href="#" className="flex items-center text-orange-600 font-medium text-sm group-hover:underline">
                        Get Help <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>
            </div>

            <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3">
                <Lock className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                    <h4 className="font-bold text-red-900 text-sm">Restricted Access Area</h4>
                    <p className="text-xs text-red-700 mt-1">
                        You do not have permissions to view Dashboard Widgets, Project Lists, or Financial Reports.
                        If you believe this is an error, please contact your system administrator to adjust your Role Hierarchy Level.
                    </p>
                </div>
            </div>
        </div>
    );
}
