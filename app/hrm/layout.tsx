"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard, Users, UserCheck, Banknote,
    CalendarDays, Briefcase, ClipboardList, Shield,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

const ALL_HRM_LINKS = [
    { name: 'Dashboard', href: '/hrm', icon: LayoutDashboard, adminOnly: true },
    { name: 'Employees', href: '/hrm/employees', icon: Users, adminOnly: true },
    { name: 'Attendance', href: '/hrm/attendance', icon: UserCheck, adminOnly: false },
    { name: 'Attendance Report', href: '/hrm/attendance-report', icon: ClipboardList, adminOnly: true },
    { name: 'Payroll', href: '/hrm/payroll', icon: Banknote, adminOnly: true },
    { name: 'Leave', href: '/hrm/leave', icon: CalendarDays, adminOnly: false },
    { name: 'Staff Access', href: '/hrm/staff-access', icon: Shield, adminOnly: true },
    { name: 'Documents', href: '/hrm/documents', icon: Briefcase, adminOnly: false },
    { name: 'Interview', href: '/hrm/interview', icon: Users, adminOnly: true },
];

// Pages that non-admin users are allowed to visit
const STAFF_ALLOWED = ['/hrm/attendance', '/hrm/leave', '/hrm/documents'];

function isAdminRole(role: string) {
    const r = role.toLowerCase();
    return r === 'admin' || r === 'super-admin' || r === 'manager' || r === 'hr';
}

export default function HRMLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();

    const role = session?.user?.role || '';
    // While loading: assume admin so the full nav renders instantly.
    // The redirect guard runs only after session is confirmed.
    const confirmedAdmin = status === 'authenticated' ? isAdminRole(role) : true;
    const confirmedStaff = status === 'authenticated' && !isAdminRole(role);

    // ── Staff redirect guard (only after we KNOW the role) ──────────────────
    useEffect(() => {
        if (status !== 'authenticated') return;   // not ready yet
        if (isAdminRole(role)) return;            // admin — no restriction

        const allowed = STAFF_ALLOWED.some(
            p => pathname === p || pathname.startsWith(p + '/')
        );
        if (!allowed) {
            router.replace('/hrm/attendance');
        }
    }, [pathname, status, role]);

    // ── Nav links: while loading show all; once confirmed restrict ───────────
    const visibleLinks = ALL_HRM_LINKS.filter(link => !link.adminOnly || confirmedAdmin);

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex items-center gap-6 border-b pb-4 overflow-x-auto">
                {visibleLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive =
                        pathname === link.href ||
                        (link.href !== '/hrm' && pathname.startsWith(link.href));
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary whitespace-nowrap',
                                isActive ? 'text-primary' : 'text-muted-foreground'
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {link.name}
                        </Link>
                    );
                })}
            </div>

            {/*
             * Don't withhold children while loading.
             * If user is a confirmed staff on an admin page, hide content
             * while the redirect fires (avoids flash of forbidden content).
             */}
            <div className="flex-1 h-full min-h-0 overflow-y-auto">
                {confirmedStaff &&
                    !STAFF_ALLOWED.some(p => pathname === p || pathname.startsWith(p + '/'))
                    ? null        // blank while redirect fires — no forbidden content flash
                    : children}
            </div>
        </div>
    );
}
