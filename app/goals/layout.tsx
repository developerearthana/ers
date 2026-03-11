"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Target, BarChart2, CalendarDays, ArrowUpRight, LayoutDashboard, Settings, UserPlus } from 'lucide-react';

const goalsLinks = [
    { name: 'Dashboard', href: '/goals', icon: Target },
    { name: 'Strategic Plan', href: '/goals/plan', icon: CalendarDays },
    { name: 'Assign', href: '/goals/assign', icon: UserPlus },
    { name: 'KPI Reports', href: '/goals/kpi', icon: BarChart2 },
    { name: 'Analytics Board', href: '/goals/board', icon: LayoutDashboard },
    { name: 'KPI Library', href: '/goals/templates', icon: Target },
    { name: 'Reviews', href: '/goals/review', icon: ArrowUpRight },
    { name: 'Admin View', href: '/goals/admin', icon: Settings },
];

export default function GoalsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex items-center gap-6 border-b pb-4 overflow-x-auto">
                {goalsLinks.map((link) => {
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
