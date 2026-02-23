"use client";

import { Plus, Users, Briefcase, ShoppingBag, UserPlus, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import ContactTable from '@/components/contacts/ContactTable';
import { PageWrapper, CardWrapper } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { getContacts, getContactStats } from '@/app/actions/contacts';
import { seedMasters } from '@/app/actions/masters';
import { toast } from 'sonner';

export default function ContactsPage() {
    const [stats, setStats] = useState({
        total: 0,
        clients: 0,
        vendors: 0,
        leads: 0
    });
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Trigger seed if needed (lazy seeding)
            await seedMasters();

            const [contactsRes, statsRes] = await Promise.all([
                getContacts(),
                getContactStats()
            ]);

            if (contactsRes.success && contactsRes.data) {
                setContacts(contactsRes.data);
            }
            if (statsRes.success && statsRes.data) {
                setStats(statsRes.data);
            }
        } catch (error) {
            toast.error("Failed to load contacts data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Contacts...</div>;

    const statCards = [
        { label: "Total Contacts", value: stats.total.toString(), sub: "All Types", icon: Users, color: "bg-white0/10 text-blue-600", border: "border-border" },
        { label: "Active Clients", value: stats.clients.toString(), sub: "Recurrent", icon: Briefcase, color: "bg-emerald-500/10 text-emerald-600", border: "border-emerald-100" },
        { label: "Vendors", value: stats.vendors.toString(), sub: "Active", icon: ShoppingBag, color: "bg-white0/10 text-orange-600", border: "border-border" },
        { label: "Leads", value: stats.leads.toString(), sub: "Potential", icon: UserPlus, color: "bg-white0/10 text-purple-600", border: "border-border" },
    ];

    return (
        <PageWrapper className="space-y-6 max-w-7xl mx-auto p-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Contacts</h1>
                    <p className="text-muted-foreground mt-1">Manage your professional network and relationships.</p>
                </div>
                <Link href="/contacts/add">
                    <Button className="shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Contact
                    </Button>
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, idx) => (
                    <CardWrapper key={idx} delay={idx * 0.1} className={`glass-card p-5 rounded-2xl border ${stat.border}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                            </div>
                            <div className={`p-2.5 rounded-xl ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-lg">
                            <ArrowUpRight className="w-3 h-3" /> {stat.sub}
                        </div>
                    </CardWrapper>
                ))}
            </div>

            {/* Contacts Table */}
            <ContactTable contacts={contacts} />
        </PageWrapper>
    );
}
