"use client";

import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, IndianRupee } from 'lucide-react';

export default function AccountsDashboard() {
    const stats = [
        { label: "Total Income", value: "₹24.5 Lakhs", trend: "+12.5% vs last month", isUp: true, icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
        { label: "Total Expenses", value: "₹12.8 Lakhs", trend: "+5% vs last month", isUp: false, icon: TrendingDown, color: "text-red-600", bg: "bg-red-100" },
        { label: "Net Profit", value: "₹11.7 Lakhs", trend: "+18% vs last month", isUp: true, icon: Wallet, color: "text-blue-600", bg: "bg-blue-100" },
        { label: "Cash on Hand", value: "₹5.2 Lakhs", trend: "Current", isUp: true, icon: IndianRupee, color: "text-purple-600", bg: "bg-purple-100" },
    ];

    const recentTransactions = [
        { id: 1, desc: "Payment from TechFlow", category: "Sales", date: "Today, 10:30 AM", amount: "+ ₹1,20,000", type: "income" },
        { id: 2, desc: "Office Rent - March", category: "Operations", date: "Yesterday, 4:00 PM", amount: "- ₹45,000", type: "expense" },
        { id: 3, desc: "Vendor Payment - Apex", category: "Purchase", date: "23 Mar, 11:20 AM", amount: "- ₹85,000", type: "expense" },
        { id: 4, desc: "Service Revenue", category: "Services", date: "22 Mar, 2:15 PM", amount: "+ ₹25,000", type: "income" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
                <p className="text-gray-500">Track your cash flow and financial health.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="glass-card p-6 rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            {stat.isUp !== undefined && (
                                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${stat.isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {stat.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    <span className="hidden xl:inline">{stat.trend}</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Cash Flow Chart Placeholder */}
                <div className="lg:col-span-2 glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Cash Flow</h3>
                    <div className="h-64 bg-background/50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                        [Cash Flow Chart Placeholder]
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="glass-card p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
                        <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
                    </div>
                    <div className="space-y-4">
                        {recentTransactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-background transition-colors border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{tx.desc}</p>
                                        <p className="text-xs text-gray-500">{tx.category} • {tx.date}</p>
                                    </div>
                                </div>
                                <span className={`font-bold text-sm ${tx.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                                    {tx.amount}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
