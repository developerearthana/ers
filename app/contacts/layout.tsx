"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Users, Briefcase, ShoppingBag, UserPlus } from 'lucide-react';

const contactsLinks = [
    { name: 'All Contacts', href: '/contacts', icon: Users },
    { name: 'Clients', href: '/contacts/clients', icon: Briefcase },
    { name: 'Vendors', href: '/masters/vendors', icon: ShoppingBag },
    { name: 'Leads', href: '/contacts/leads', icon: UserPlus },
    { name: 'Consultants', href: '/contacts/consultants', icon: Briefcase },
];

export default function ContactsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex items-center gap-6 border-b pb-4 overflow-x-auto">
                {contactsLinks.map((link) => {
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
