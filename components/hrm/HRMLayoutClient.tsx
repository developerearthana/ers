"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard, Users, UserCheck, Banknote,
    CalendarDays, Briefcase, ClipboardList, Shield,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const ALL_HRM_LINKS = [
    { name: 'Dashboard', href: '/hrm', icon: LayoutDashboard, adminOnly: true },
    { name: 'Employees', href: '/hrm/employees', icon: Users, adminOnly: true },
    { name: 'Attendance', href: '/hrm/attendance', icon: UserCheck, adminOnly: false },
    { name: 'Attendance Report', href: '/hrm/attendance-report', icon: ClipboardList, adminOnly: true },
    { name: 'Payroll', href: '/hrm/payroll', icon: Banknote, adminOnly: true },
    { name: 'Leave', href: '/hrm/leave', icon: CalendarDays, adminOnly: false },
    { name: 'Staff Access', href: '/hrm/staff-access', icon: Shield, adminOnly: true },
    { name: 'Documents', href: '/hrm/documents', icon: Briefcase, adminOnly: true },
    { name: 'Interview', href: '/hrm/interview', icon: Users, adminOnly: true },
];

const STAFF_ALLOWED = ['/hrm/attendance', '/hrm/leave'];

function isAdminRole(role: string) {
    if (!role) return false;
    const r = role.toLowerCase();
    return r === 'admin' || r === 'super-admin' || r === 'manager' || r === 'hr';
}

export default function HRMLayoutClient({ children, role: initialRole }: { children: React.ReactNode, role: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    
    // Combine Server Prop with Client Session to ensure it updates during soft nav
    const currentRole = session?.user?.role || initialRole;
    
    const confirmedAdmin = isAdminRole(currentRole);
    const confirmedStaff = currentRole ? !isAdminRole(currentRole) : false;

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // ── Staff redirect guard ──────────────────
    useEffect(() => {
        if (!currentRole) return;
        if (isAdminRole(currentRole)) return;

        const allowed = STAFF_ALLOWED.some(
            p => pathname === p || pathname.startsWith(p + '/')
        );
        if (!allowed) {
            router.replace('/hrm/attendance');
        }
    }, [pathname, currentRole, router]);

    const visibleLinks = ALL_HRM_LINKS.filter(link => !link.adminOnly || confirmedAdmin);

    // If no role yet
    if (!currentRole && !mounted) {
        return (
            <div className="flex flex-col h-full items-center justify-center gap-4">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-muted-foreground">Synchronizing Workspace...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex items-center gap-6 border-b pb-4 overflow-x-auto">
                <div 
                    className={cn(
                        "flex items-center gap-6 transition-opacity duration-300", 
                        mounted ? "opacity-100" : "opacity-0"
                    )}
                >
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
            </div>

            <div className="flex-1 h-full min-h-0 overflow-y-auto">
                <div 
                    className={cn(
                        "h-full transition-opacity duration-300",
                        (confirmedStaff && !STAFF_ALLOWED.some(p => pathname === p || pathname.startsWith(p + '/'))) || (!currentRole && mounted)
                            ? "opacity-0 pointer-events-none select-none" 
                            : "opacity-100"
                    )}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
