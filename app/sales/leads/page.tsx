"use client";

import { Plus, Search, Filter, Mail, Phone, ArrowRight, TrendingUp, Loader2, X, Check, ChevronsUpDown, MessageSquarePlus, Sparkles } from 'lucide-react';
import { PageWrapper, CardWrapper } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { getLeadsWithAI, createLead, addFollowUp } from '@/app/actions/sales';
import { getContacts } from '@/app/actions/contacts';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import ObjectionGuide from '@/components/sales/ObjectionGuide';
import { AILeadScoreCard, SmartActionChip } from '@/components/sales/AILeadScoreCard';

interface Lead {
    _id: string;
    name: string;
    company: string;
    email: string;
    phone?: string;
    status: string;
    source?: string;
    value?: number;
    probability?: number;
    remarks?: { status: string; note: string; date: Date }[];
    // AI fields
    aiScore?: number;
    aiScoreLabel?: 'Hot' | 'Warm' | 'Cold';
    aiScoreBreakdown?: any;
    suggestedAction?: { action: string; priority: 'high' | 'medium' | 'low'; icon: string };
}

interface Contact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    type: string;
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Contact Selection State
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [contactOpen, setContactOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<string>("");

    // Create Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'New',
        source: '',
        value: '',
        probability: '0'
    });

    // Follow Up Modal State
    const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [followUpData, setFollowUpData] = useState({ status: '', remark: '' });

    useEffect(() => {
        loadLeads();
        loadContacts();
    }, []);

    const loadLeads = async () => {
        try {
            const res = await getLeadsWithAI();
            if (res.success && res.data) {
                setLeads(res.data);
            } else {
                toast.error("Failed to load leads");
            }
        } catch (error) {
            toast.error("Error loading leads");
        } finally {
            setLoading(false);
        }
    };

    const loadContacts = async () => {
        try {
            const res = await getContacts({ type: 'Lead' });
            if (res.success && res.data) {
                setContacts(res.data);
            }
        } catch (error) {
            console.error("Failed to load contacts", error);
        }
    }

    const handleContactSelect = (contactName: string) => {
        const contact = contacts.find(c => c.name === contactName);
        if (contact) {
            setSelectedContact(contactName);
            setContactOpen(false);
            setFormData(prev => ({
                ...prev,
                name: contact.name,
                company: contact.company || prev.company,
                email: contact.email || prev.email,
                phone: contact.phone || prev.phone
            }));
        }
    };

    const handleCreateLead = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                value: parseFloat(formData.value) || 0,
                probability: parseFloat(formData.probability) || 0
            };
            const res = await createLead(payload);
            if (res.success) {
                toast.success("Lead created successfully");
                setIsModalOpen(false);
                setFormData({ name: '', company: '', email: '', phone: '', status: 'New', source: '', value: '', probability: '0' });
                setSelectedContact("");
                loadLeads();
            } else {
                toast.error("Failed to create lead: " + res.error);
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openFollowUp = (lead: Lead) => {
        setSelectedLead(lead);
        setFollowUpData({ status: lead.status, remark: '' });
        setIsFollowUpOpen(true);
    };

    const handleFollowUpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLead) return;

        setIsSubmitting(true);
        try {
            const res = await addFollowUp(selectedLead._id, followUpData.status, followUpData.remark);
            if (res.success) {
                toast.success("Follow-up added");
                setIsFollowUpOpen(false);
                loadLeads();
            } else {
                toast.error("Failed to add follow-up");
            }
        } catch (e) {
            toast.error("Error adding follow-up");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <PageWrapper className="space-y-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Leads</h1>
                    <p className="text-muted-foreground mt-1">Capture and nurture sales opportunities.</p>
                </div>
                <div className="flex gap-3">
                    <ObjectionGuide />
                    <Button className="shadow-lg shadow-primary/20 hover:scale-105 transition-all" onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Lead
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between border border-white/40 shadow-sm">
                <div className="relative flex-1 w-full md:max-w-md group">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white/50 focus:bg-white transition-all text-sm"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        aria-label="Filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 focus:outline-none bg-white hover:bg-background cursor-pointer"
                    >
                        <option value="All">All Statuses</option>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Lost">Lost</option>
                        <option value="Converted">Converted</option>
                    </select>
                </div>
            </div>

            {/* Leads List */}
            {filteredLeads.length === 0 ? (
                <div className="text-center py-12 bg-background rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No leads found.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredLeads.map((lead, idx) => (
                        <CardWrapper key={lead._id} delay={idx * 0.05} className="glass-card p-5 rounded-2xl border border-white/40 hover:border-primary/30 hover:shadow-lg transition-all group flex flex-col justify-between h-full bg-gradient-to-br from-white/60 to-white/30">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-900 line-clamp-1" title={lead.name}>{lead.name}</h3>
                                        <p className="text-xs text-muted-foreground font-medium">{lead.company}</p>
                                    </div>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                                        lead.status === 'New' ? 'bg-white text-blue-700 border-border' :
                                            lead.status === 'Qualified' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                lead.status === 'Converted' ? 'bg-white text-green-700 border-border' :
                                                    lead.status === 'Lost' ? 'bg-red-50 text-red-700 border-red-100' :
                                                        'bg-amber-50 text-amber-700 border-amber-100'
                                    )}>
                                        {lead.status}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 group-hover:text-primary/80 transition-colors">
                                        <Mail className="w-3.5 h-3.5 opacity-70" />
                                        <span className="truncate">{lead.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Phone className="w-3.5 h-3.5 opacity-70" />
                                        {lead.phone || 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <span className="bg-white px-1.5 rounded">{lead.source || 'Unknown'}</span>
                                    </div>
                                    {/* AI Score Badge */}
                                    {lead.aiScore !== undefined && (
                                        <div className="mt-2">
                                            <AILeadScoreCard
                                                score={lead.aiScore}
                                                label={lead.aiScoreLabel || 'Cold'}
                                                breakdown={lead.aiScoreBreakdown}
                                                compact
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-2 pt-3 border-t border-gray-100/50">
                                {/* Suggested Action */}
                                {lead.suggestedAction && (
                                    <div className="mb-2">
                                        <SmartActionChip
                                            action={lead.suggestedAction.action}
                                            priority={lead.suggestedAction.priority}
                                        />
                                    </div>
                                )}
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-lg font-bold text-gray-900">₹{lead.value?.toLocaleString() || '0'}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => openFollowUp(lead)} className="text-xs gap-1 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all">
                                        <MessageSquarePlus className="w-3.5 h-3.5" />
                                        Follow Up
                                    </Button>
                                </div>
                            </div>
                        </CardWrapper>
                    ))}
                </div>
            )}

            {/* Create Lead Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Add New Lead</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto pr-2 -mr-2">
                        <form onSubmit={handleCreateLead} className="space-y-4 p-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 flex flex-col">
                                    <Label htmlFor="name">Name *</Label>
                                    <Popover open={contactOpen} onOpenChange={setContactOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={contactOpen}
                                                className="w-full justify-between font-normal"
                                            >
                                                {formData.name || "Select Contact..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white">
                                            <Command className="bg-white">
                                                <CommandInput placeholder="Search contacts..." />
                                                <CommandEmpty>No contact found.</CommandEmpty>
                                                <CommandGroup>
                                                    {contacts.map((contact) => (
                                                        <CommandItem
                                                            key={contact.id}
                                                            value={contact.name}
                                                            onSelect={handleContactSelect}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    formData.name === contact.name ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {contact.name} ({contact.type})
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company *</Label>
                                    <Input id="company" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Acme Inc" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="New">New</SelectItem>
                                            <SelectItem value="Contacted">Contacted</SelectItem>
                                            <SelectItem value="Qualified">Qualified</SelectItem>
                                            <SelectItem value="Lost">Lost</SelectItem>
                                            <SelectItem value="Converted">Converted</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="value">Est. Value (₹)</Label>
                                    <Input id="value" type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="probability">Probability (%)</Label>
                                    <Input id="probability" type="number" min="0" max="100" value={formData.probability} onChange={(e) => setFormData({ ...formData, probability: e.target.value })} placeholder="0" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="source">Source</Label>
                                <Input id="source" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} placeholder="e.g. Website, Referral" />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Create Lead
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Follow Up Modal */}
            <Dialog open={isFollowUpOpen} onOpenChange={setIsFollowUpOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Follow Up: {selectedLead?.name}</DialogTitle>
                        <DialogDescription>
                            Log a new interaction and update the status.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFollowUpSubmit} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>New Status</Label>
                            <Select value={followUpData.status} onValueChange={(v) => setFollowUpData({ ...followUpData, status: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="New">New</SelectItem>
                                    <SelectItem value="Contacted">Contacted</SelectItem>
                                    <SelectItem value="Qualified">Qualified</SelectItem>
                                    <SelectItem value="Lost">Lost</SelectItem>
                                    <SelectItem value="Converted">Converted</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Remarks / Notes</Label>
                            <Textarea
                                required
                                value={followUpData.remark}
                                onChange={(e) => setFollowUpData({ ...followUpData, remark: e.target.value })}
                                placeholder="Client requested a demo..."
                                className="min-h-[100px]"
                            />
                        </div>

                        {selectedLead?.remarks && selectedLead.remarks.length > 0 && (
                            <div className="mt-4 border-t pt-4">
                                <Label className="mb-2 block text-xs uppercase text-gray-500">History</Label>
                                <div className="max-h-[150px] overflow-y-auto space-y-3 pr-2">
                                    {selectedLead.remarks.slice().reverse().map((rem, i) => (
                                        <div key={i} className="text-sm bg-background p-2 rounded border border-gray-100">
                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                <span className="font-semibold text-gray-700">{rem.status}</span>
                                                <span>{new Date(rem.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-600">{rem.note}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsFollowUpOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Save Follow-up
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </PageWrapper>
    );
}
