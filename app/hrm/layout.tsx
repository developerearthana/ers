"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, UserCheck, Banknote, CalendarDays, Briefcase } from 'lucide-react';

const hrmLinks = [
    { name: 'Dashboard', href: '/hrm', icon: LayoutDashboard },
    { name: 'Employees', href: '/hrm/employees', icon: Users },
    { name: 'Attendance', href: '/hrm/attendance', icon: UserCheck },
    { name: 'Payroll', href: '/hrm/payroll', icon: Banknote },
    { name: 'Leave', href: '/hrm/leave', icon: CalendarDays },
    { name: 'Documents', href: '/hrm/documents', icon: Briefcase },
    { name: 'Interview', href: '/hrm/interview', icon: Users },
];

export default function HRMLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex items-center gap-6 border-b pb-4 overflow-x-auto">
                {hrmLinks.map((link) => {
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
