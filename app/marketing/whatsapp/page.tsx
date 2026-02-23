"use client";

import { useState } from 'react';
import { MessageCircle, Settings, Users, Send, CheckCircle2, AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { PageWrapper, CardWrapper } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function WhatsAppPage() {
    const [isConnected, setIsConnected] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleConnect = () => {
        if (!apiKey || !phoneNumber) {
            toast.error("Please enter API Key and Phone Number");
            return;
        }
        // Mock connection
        setTimeout(() => {
            setIsConnected(true);
            toast.success("Connected to WhatsApp Business API");
        }, 1000);
    };

    return (
        <PageWrapper className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400">WhatsApp Marketing</h1>
                    <p className="text-muted-foreground mt-1">Connect with customers directly via WhatsApp Business API.</p>
                </div>
                <div className="flex gap-2">
                    <span className={cn("px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2",
                        isConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {isConnected ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {isConnected ? "API Connected" : "Disconnected"}
                    </span>
                </div>
            </div>

            <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="campaigns">Broadcasts</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="mt-6 space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <CardWrapper delay={0.1} className="glass-card p-6 rounded-xl border-border bg-white/30">
                            <h3 className="text-sm font-medium text-gray-500">Messages Sent</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">1,240</p>
                            <span className="text-xs text-green-600 font-medium">+12% this week</span>
                        </CardWrapper>
                        <CardWrapper delay={0.2} className="glass-card p-6 rounded-xl border-border bg-white/30">
                            <h3 className="text-sm font-medium text-gray-500">Read Rate</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">88%</p>
                            <span className="text-xs text-blue-600 font-medium">+2% vs avg</span>
                        </CardWrapper>
                        <CardWrapper delay={0.3} className="glass-card p-6 rounded-xl border-border bg-white/30">
                            <h3 className="text-sm font-medium text-gray-500">Replies</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">342</p>
                            <span className="text-xs text-purple-600 font-medium">Active conversations</span>
                        </CardWrapper>
                    </div>

                    <CardWrapper className="glass-card p-6 rounded-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Recent Broadcasts</h3>
                            <Button size="sm" variant="outline">View All</Button>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-gray-100 hover:border-green-200 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-green-100 p-2 rounded-full text-green-600">
                                            <Send className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">Summer Sale Announcement</p>
                                            <p className="text-xs text-gray-500">Sent to 450 contacts • 2h ago</p>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs">
                                        <div className="font-bold text-green-600">98% Delivered</div>
                                        <div className="text-gray-400">85% Read</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardWrapper>
                </TabsContent>

                <TabsContent value="campaigns" className="mt-6">
                    <CardWrapper className="glass-card p-8 rounded-xl text-center border-dashed border-2 border-gray-200">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="w-16 h-16 bg-white text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Create New Broadcast</h3>
                            <p className="text-gray-500">Send bulk messages to your customer lists using approved templates.</p>
                            <Button className="w-full bg-green-600 hover:bg-primary/90">
                                <Plus className="w-4 h-4 mr-2" /> Start Campaign
                            </Button>
                        </div>
                    </CardWrapper>
                </TabsContent>

                <TabsContent value="settings" className="mt-6">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <CardWrapper className="glass-card p-6 rounded-xl">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-gray-500" />
                                API Configuration
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">WhatsApp Business Phone Number ID</label>
                                    <Input
                                        placeholder="e.g. 1029384756"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Permanent Access Token</label>
                                    <Input
                                        type="password"
                                        placeholder="EAAG..."
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500">From Meta for Developers Dashboard</p>
                                </div>
                                <Button
                                    className={cn("w-full transition-all", isConnected ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200" : "bg-green-600 hover:bg-primary/90 text-white")}
                                    onClick={() => isConnected ? setIsConnected(false) : handleConnect()}
                                >
                                    {isConnected ? "Disconnect" : "Connect API"}
                                </Button>
                            </div>
                        </CardWrapper>

                        <CardWrapper className="glass-card p-6 rounded-xl opacity-80">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Webhook Settings</h3>
                                    <p className="text-xs text-gray-500">Receive real-time updates for messages.</p>
                                </div>
                                <Switch disabled checked={false} />
                            </div>
                        </CardWrapper>
                    </div>
                </TabsContent>
            </Tabs>
        </PageWrapper>
    );
}
