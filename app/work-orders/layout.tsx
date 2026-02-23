"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ClipboardList, RotateCw, Settings } from 'lucide-react';

const workOrderLinks = [
    { name: 'Dashboard', href: '/work-orders', icon: LayoutDashboard },
    { name: 'My Orders', href: '/work-orders/my-orders', icon: ClipboardList },
    { name: 'Service Requests', href: '/work-orders/requests', icon: RotateCw },
    { name: 'Settings', href: '/work-orders/settings', icon: Settings },
];

export default function WorkOrdersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex items-center gap-6 border-b pb-4 overflow-x-auto">
                {workOrderLinks.map((link) => {
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
                {children}
            </div>
        </div>
    );
}
