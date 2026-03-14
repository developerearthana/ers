"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Calendar, CheckSquare, MessageSquare, FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';

const activityLinks = [
    { name: 'Dashboard', href: '/activity', icon: LayoutDashboard },
    { name: 'Calendar', href: '/activity/calendar', icon: Calendar },
    { name: 'Team Tasks', href: '/activity/todo', icon: CheckSquare },
    { name: 'Chat', href: '/activity/chat', icon: MessageSquare },
    { name: 'Documents', href: '/activity/documents', icon: FileText },
];

export default function ActivityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const role = session?.user?.role?.toLowerCase() || '';
    const isAdmin = role === 'admin' || role === 'super-admin' || role === 'hr' || role === 'manager';

    const visibleLinks = activityLinks.filter(link => {
        if (link.name === 'Documents' && isAdmin) return false;
        return true;
    });

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex items-center gap-6 border-b pb-4 overflow-x-auto">
                {visibleLinks.map((link) => {
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
