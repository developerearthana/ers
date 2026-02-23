"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Megaphone, Share2, Image as ImageIcon, MessageCircle, Bot } from 'lucide-react';

const marketingLinks = [
    { name: 'Dashboard', href: '/marketing', icon: LayoutDashboard },
    { name: 'Campaigns', href: '/marketing/campaigns', icon: Megaphone },
    { name: 'Social', href: '/marketing/social', icon: Share2 },
    { name: 'WhatsApp', href: '/marketing/whatsapp', icon: MessageCircle },
    { name: 'AI Content', href: '/marketing/ai-content', icon: Bot },
    { name: 'Assets', href: '/marketing/assets', icon: ImageIcon },
];

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex items-center gap-6 border-b pb-4 overflow-x-auto">
                {marketingLinks.map((link) => {
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
