"use client";

import { Plus, Search, Filter, Megaphone, TrendingUp, MousePointer, DollarSign, Bot, FileText, PenTool, Sparkles, Loader2 } from 'lucide-react';
import { getCampaigns, createCampaign } from '@/app/actions/marketing';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PageWrapper, CardWrapper } from '@/components/ui/page-wrapper';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Creation Flow State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [creationStep, setCreationStep] = useState<'type-select' | 'details' | 'ai-generating'>('type-select');
    const [selectedType, setSelectedType] = useState<'AI' | 'Template' | 'Custom' | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        goal: '',
        targetAudience: '',
        budget: ''
    });

    useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        try {
            const res = await getCampaigns();
            if (res.success && res.data) {
                setCampaigns(res.data);
            }
        } catch (error) {
            toast.error("Failed to load campaigns");
        } finally {
            setLoading(false);
        }
    };

    const handleStartCreate = () => {
        setIsCreateModalOpen(true);
        setCreationStep('type-select');
        setSelectedType(null);
        setFormData({ name: '', type: '', goal: '', targetAudience: '', budget: '' });
    };

    const handleSelectType = (type: 'AI' | 'Template' | 'Custom') => {
        setSelectedType(type);
        setCreationStep('details');

        // Pre-fill based on type (Mock)
        if (type === 'Template') {
            setFormData(prev => ({ ...prev, name: 'Summer Sale 2026', type: 'Email Blast' }));
        }
    };

    const handleGenerateAI = () => {
        if (!formData.goal || !formData.targetAudience) {
            toast.error("Please fill in Goal and Target Audience");
            return;
        }
        setCreationStep('ai-generating');
        setTimeout(() => {
            // Mock AI response
            setFormData(prev => ({
                ...prev,
                name: `AI Campaign: ${formData.goal} for ${formData.targetAudience}`,
                budget: '5000'
            }));
            setCreationStep('details');
            toast.success("AI Generation Complete!");
        }, 2000);
    };

    const handleSubmit = async () => {
        // Mock submission
        toast.success("Campaign Created Successfully!");
        setIsCreateModalOpen(false);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Campaigns...</div>;

    return (
        <PageWrapper className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
                    <p className="text-gray-500">Manage marketing campaigns and track performance.</p>
                </div>
                <Button
                    onClick={handleStartCreate}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Campaign
                </Button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-background">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Campaign Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {campaigns.length === 0 && <p className="text-gray-500 col-span-2 text-center p-8">No campaigns found.</p>}
                {campaigns.map((camp) => (
                    <CardWrapper key={camp.id} className="glass-card p-6 rounded-xl hover:shadow-md transition-shadow group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                                    <Megaphone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{camp.name}</h3>
                                    <p className="text-xs text-gray-500">{camp.type}</p>
                                </div>
                            </div>
                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium",
                                camp.status === 'Active' ? 'bg-green-100 text-green-700' :
                                    camp.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700')}>
                                {camp.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
                                    <DollarSign className="w-3 h-3" /> Spend
                                </div>
                                <p className="font-bold text-gray-900 text-sm">{camp.spent}</p>
                                <p className="text-[10px] text-gray-400">of {camp.budget}</p>
                            </div>
                            <div className="text-center border-l border-gray-100">
                                <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
                                    <TrendingUp className="w-3 h-3" /> ROI
                                </div>
                                <p className="font-bold text-green-600 text-sm">{camp.roi}</p>
                            </div>
                            <div className="text-center border-l border-gray-100">
                                <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
                                    <MousePointer className="w-3 h-3" /> Clicks
                                </div>
                                <p className="font-bold text-blue-600 text-sm">{camp.clicks}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                            <div className="w-full bg-white h-1.5 rounded-full mr-4">
                                <div className="bg-purple-600 h-1.5 rounded-full w-[45%]"></div>
                            </div>
                            <button className="text-sm font-medium text-purple-600 hover:text-purple-700 whitespace-nowrap">Manage</button>
                        </div>
                    </CardWrapper>
                ))}
            </div>

            {/* Create Campaign Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Create New Campaign</DialogTitle>
                        <DialogDescription>
                            {creationStep === 'type-select' ? "Choose how you would like to start." : "Configure your campaign details."}
                        </DialogDescription>
                    </DialogHeader>

                    {creationStep === 'type-select' && (
                        <div className="grid md:grid-cols-3 gap-4 py-4">
                            <div
                                onClick={() => handleSelectType('AI')}
                                className="border-2 border-dashed border-gray-200 hover:border-purple-500 hover:bg-white rounded-xl p-6 cursor-pointer transition-all text-center flex flex-col items-center gap-3 group"
                            >
                                <div className="p-3 bg-purple-100 rounded-full text-purple-600 group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">AI Optimized</h3>
                                    <p className="text-xs text-gray-500 mt-1">Let AI create the perfect strategy based on your goals.</p>
                                </div>
                            </div>

                            <div
                                onClick={() => handleSelectType('Template')}
                                className="border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-white rounded-xl p-6 cursor-pointer transition-all text-center flex flex-col items-center gap-3 group"
                            >
                                <div className="p-3 bg-blue-100 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">Template Based</h3>
                                    <p className="text-xs text-gray-500 mt-1">Start from a proven industry template.</p>
                                </div>
                            </div>

                            <div
                                onClick={() => handleSelectType('Custom')}
                                className="border-2 border-dashed border-gray-200 hover:border-orange-500 hover:bg-white rounded-xl p-6 cursor-pointer transition-all text-center flex flex-col items-center gap-3 group"
                            >
                                <div className="p-3 bg-orange-100 rounded-full text-orange-600 group-hover:scale-110 transition-transform">
                                    <PenTool className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">Custom Script</h3>
                                    <p className="text-xs text-gray-500 mt-1">Build your campaign from scratch.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {creationStep === 'ai-generating' && (
                        <div className="py-20 text-center">
                            <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-4" />
                            <h3 className="text-lg font-bold">Generating AI Strategy...</h3>
                            <p className="text-gray-500">Analyzing your goals and audience.</p>
                        </div>
                    )}

                    {creationStep === 'details' && (
                        <div className="py-4 space-y-4">
                            {selectedType === 'AI' && (
                                <div className="bg-white border border-border p-4 rounded-lg flex gap-3 text-sm text-purple-800 mb-4">
                                    <Bot className="w-5 h-5 flex-shrink-0" />
                                    <div>
                                        <strong>AI Assistant Enabled:</strong> Fill in your Goal and Audience, and I'll generate the details for you.
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Campaign Goal</Label>
                                    <Input
                                        placeholder="e.g. Increase Brand Awareness"
                                        value={formData.goal}
                                        onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Audience</Label>
                                    <Input
                                        placeholder="e.g. Small Business Owners"
                                        value={formData.targetAudience}
                                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                    />
                                </div>
                            </div>

                            {selectedType === 'AI' && (
                                <Button
                                    variant="secondary"
                                    onClick={handleGenerateAI}
                                    className="w-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-900 border-none"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" /> Generate Strategy with AI
                                </Button>
                            )}

                            <div className="space-y-2">
                                <Label>Campaign Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Campaign Type</Label>
                                    <Input
                                        placeholder="Email / Social / Ads"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Budget ($)</Label>
                                    <Input
                                        value={formData.budget}
                                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        {creationStep === 'details' && (
                            <Button variant="ghost" onClick={() => setCreationStep('type-select')}>Back</Button>
                        )}
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        {creationStep === 'details' && (
                            <Button onClick={handleSubmit}>Create Campaign</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageWrapper>
    );
}
