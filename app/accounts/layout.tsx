"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Wallet, Receipt, FileBarChart, Building2, Settings, ShieldCheck } from 'lucide-react';

const accountsLinks = [
    { name: 'Dashboard', href: '/accounts', icon: LayoutDashboard },
    { name: 'Transactions', href: '/accounts/transactions', icon: Receipt },
    { name: 'Bank Accounts', href: '/accounts/banking', icon: Building2 },
    { name: 'Reports', href: '/accounts/reports', icon: FileBarChart },
    { name: 'Receipts', href: '/accounts/receipts', icon: Receipt },
    { name: 'Verify', href: '/accounts/verify', icon: ShieldCheck },
    { name: 'Settings', href: '/accounts/settings', icon: Settings },
];

export default function AccountsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex items-center gap-6 border-b pb-4 overflow-x-auto">
                {accountsLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {link.name}
                        </Link>
                    );
                })}
            </div>
            <div className="flex-1 h-full min-h-0 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}
