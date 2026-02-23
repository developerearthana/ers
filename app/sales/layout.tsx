"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BarChart3, Users, FileText, ShoppingCart, PieChart, Sparkles, Bot } from 'lucide-react';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { SalesCopilot } from '@/components/sales/SalesCopilot';

const salesLinks = [
    { name: 'Dashboard', href: '/sales', icon: PieChart },
    { name: 'Leads', href: '/sales/leads', icon: Users },
    { name: 'Pipeline', href: '/sales/pipeline', icon: BarChart3 },
    { name: 'Orders', href: '/sales/orders', icon: ShoppingCart },
    { name: 'Invoices', href: '/sales/invoices', icon: FileText },
    { name: 'AI Command Center', href: '/sales/automation', icon: Sparkles },
];

export default function SalesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex items-center gap-6 border-b pb-4 overflow-x-auto">
                {salesLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
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
                <PageWrapper>
                    {children}
                </PageWrapper>
            </div>

            {/* AI Sales Copilot - Floating Chat Assistant */}
            <SalesCopilot />
        </div>
    );
}
