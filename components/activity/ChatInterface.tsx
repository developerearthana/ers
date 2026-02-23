"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, Phone, Video, Search, MoreVertical, Paperclip, Smile, Check, CheckCheck, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getConversations, getMessages, sendMessage, createConversation, getUsersForChat, clearChatHistory, deleteConversation, deleteAllConversations } from '@/app/actions/activity/chat';
import { getTeams } from "@/app/actions/organization";
import { format } from "date-fns";
import { useSession } from 'next-auth/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Message {
    _id: string;
    content: string;
    sender: string;
    createdAt: string;
    readBy: string[];
}

interface Conversation {
    _id: string;
    participants: string[];
    type: 'Individual' | 'Group';
    name?: string;
    lastMessage?: Message;
    updatedAt: string;
}

export default function ChatInterface() {
    const { data: session } = useSession();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);
    const [mastersTeams, setMastersTeams] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'Recent' | 'Contacts' | 'Teams'>('Recent');
    const [searchQuery, setSearchQuery] = useState("");

    const userId = session?.user?.id;

    // Helper to get display name
    const getConversationName = (c: Conversation) => {
        if (c.type === 'Group') return c.name || 'Group Chat';
        const otherId = c.participants.find(p => p !== userId) || 'Unknown';
        // Try to find name in availableUsers if possible, else fallback
        const user = availableUsers.find(u => u._id === otherId);
        return user ? user.name : `User ${otherId.substring(0, 5)}...`;
    };

    const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : '??';

    const fetchConversations = async () => {
        const res = await getConversations();
        if (res.success) {
            setConversations(res.data);
        }
    };

    useEffect(() => {
        const init = async () => {
            if (session?.user?.id) {
                const [usersRes, teamsRes] = await Promise.all([
                    getUsersForChat(),
                    getTeams()
                ]);
                if (usersRes.success) setAvailableUsers(usersRes.data);
                if (teamsRes) setMastersTeams(teamsRes); // getTeams returns array directly
            }
        };
        init();
        fetchConversations();
        // Poll for new messages every 5s
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, [session, activeConversationId]);


    const loadMessages = async (convId: string, scroll = true) => {
        const res = await getMessages(convId);
        if (res.success) {
            setMessages(res.data);
            if (scroll) scrollToBottom();
        }
    };

    const handleConversationClick = (id: string) => {
        setActiveConversationId(id);
        loadMessages(id);
    };

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversationId) return;

        // Optimistic update
        const tempMsg: Message = {
            _id: `temp-${Date.now()}`,
            content: newMessage,
            sender: userId || "Me",
            createdAt: new Date().toISOString(),
            readBy: []
        };
        setMessages([...messages, tempMsg]);
        setNewMessage("");
        scrollToBottom();

        try {
            const res = await sendMessage(activeConversationId, tempMsg.content);
            if (!res.success) {
                toast.error("Failed to send");
                // Remove temp?
            } else {
                // Replace temp with real
                setMessages(prev => prev.map(m => m._id === tempMsg._id ? res.data : m));
                fetchConversations(); // Update list order
            }
        } catch (error) {
            toast.error("Network error");
        }
    };

    const activeConversation = conversations.find(c => c._id === activeConversationId);



    // Create a new conversation just for testing
    const handleNewChatClick = async () => {
        setIsNewChatOpen(true);
        const res = await getUsersForChat();
        if (res.success) setAvailableUsers(res.data);
    };

    const startChat = async (targetUserIdOrTeamId: string, isTeam = false) => {
        if (isTeam) {
            const team = mastersTeams.find(t => t._id === targetUserIdOrTeamId);
            if (!team || !team.members || team.members.length === 0) {
                toast.error("Team has no members or not found");
                return;
            }
            // Check if group exists for this team (by name or participants?)
            // Simple check: Look for group type with name == team.name
            const existing = conversations.find(c => c.type === 'Group' && c.name === team.name);
            if (existing) {
                setActiveConversationId(existing._id);
                return;
            }

            const memberIds = team.members.map((m: any) => m._id || m); // Handle if populated or not
            const res = await createConversation(memberIds, 'Group', team.name);
            if (res.success) {
                fetchConversations();
                setActiveConversationId(res.data._id);
            } else {
                toast.error("Failed to create team chat");
            }
            return;
        }

        // Individual Chat
        // Check if exists
        const existing = conversations.find(c => c.type === 'Individual' && c.participants.includes(targetUserIdOrTeamId));
        if (existing) {
            setActiveConversationId(existing._id);
            setIsNewChatOpen(false);
            return;
        }

        const res = await createConversation([targetUserIdOrTeamId], 'Individual');
        if (res.success) {
            fetchConversations();
            setActiveConversationId(res.data._id);
            setIsNewChatOpen(false);
        }
    };

    const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Delete this conversation for me?")) return;
        const res = await deleteConversation(id);
        if (res.success) {
            toast.success("Conversation deleted");
            if (activeConversationId === id) setActiveConversationId(null);
            fetchConversations();
        } else {
            toast.error("Failed to delete");
        }
    };

    const handleClearHistory = async () => {
        if (!activeConversationId || !confirm("Clear all messages in this chat?")) return;
        const res = await clearChatHistory(activeConversationId);
        if (res.success) {
            toast.success("History cleared");
            setMessages([]);
        } else {
            toast.error("Failed to clear history");
        }
    };

    const handleClearAll = async () => {
        if (!confirm("Are you sure you want to delete ALL recent conversations? This cannot be undone.")) return;
        const res = await deleteAllConversations();
        if (res.success) {
            toast.success("All conversations deleted");
            setConversations([]);
            setActiveConversationId(null);
        } else {
            toast.error("Failed to clear list");
        }
    };

    // We filter list based on Tab manually now to handle standard Chat lists vs Masters Lists
    const getDisplayList = () => {
        if (activeTab === 'Contacts') {
            return availableUsers.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (activeTab === 'Teams') {
            return mastersTeams.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        // Recent
        return conversations.filter(c => {
            const name = getConversationName(c).toLowerCase();
            return name.includes(searchQuery.toLowerCase());
        });
    };

    const displayList = getDisplayList();

    return (
        <div className="flex h-full gap-6">
            {/* Sidebar */}
            <div className="w-80 glass-card border border-white/40 shadow-xl flex flex-col overflow-hidden hidden md:flex">
                <div className="p-4 border-b border-gray-100/50 bg-white/30 backdrop-blur-md flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800">Messages</h2>
                        <div className="flex gap-1">
                            {activeTab === 'Recent' && conversations.length > 0 && (
                                <Button variant="ghost" size="icon" onClick={handleClearAll} title="Clear All Chats" className="text-red-400 hover:text-red-600 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={handleNewChatClick} title="New Chat"><Plus className="h-4 w-4" /></Button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-white/50 rounded-lg">
                        <button
                            onClick={() => setActiveTab('Recent')}
                            className={cn(
                                "flex-1 text-xs font-medium py-1.5 rounded-md transition-all",
                                activeTab === 'Recent' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Recent
                        </button>
                        <button
                            onClick={() => setActiveTab('Contacts')}
                            className={cn(
                                "flex-1 text-xs font-medium py-1.5 rounded-md transition-all",
                                activeTab === 'Contacts' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Contacts
                        </button>
                        <button
                            onClick={() => setActiveTab('Teams')}
                            className={cn(
                                "flex-1 text-xs font-medium py-1.5 rounded-md transition-all",
                                activeTab === 'Teams' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Teams
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                            placeholder="Search..."
                            className="w-full pl-8 pr-3 py-2 bg-white/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    <div className="space-y-2">
                        {displayList.length > 0 ? (
                            displayList.map((item: any) => {
                                // Unified Item Renderer
                                let id = item._id || item.id;
                                let name = "";
                                let subtitle = "";
                                let initials = "";
                                let onClick = () => { };

                                if (activeTab === 'Contacts') {
                                    name = item.name;
                                    subtitle = item.email;
                                    initials = getInitials(name);
                                    onClick = () => startChat(item._id);
                                } else if (activeTab === 'Teams') {
                                    name = item.name;
                                    subtitle = `${item.members?.length || 0} Members`;
                                    // Open Team Chat logic
                                    onClick = () => startChat(item._id, true);
                                } else {
                                    // Recent / Conversation
                                    name = getConversationName(item);
                                    subtitle = item.lastMessage?.content || "No messages";
                                    initials = getInitials(name);
                                }

                                return (
                                    <div
                                        key={id}
                                        onClick={onClick}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200",
                                            activeTab === 'Recent' && activeConversationId === id ? "bg-gradient-to-r from-primary/10 to-transparent border-primary/10" : "hover:bg-white/50"
                                        )}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                            {initials}
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex justify-between items-baseline">
                                                <h3 className="font-semibold text-gray-900 truncate">{name}</h3>

                                                {activeTab === 'Recent' && (
                                                    <button
                                                        onClick={(e) => handleDeleteConversation(e, id)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 hover:text-red-500 rounded transition-all"
                                                        title="Delete Chat"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{subtitle}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400 gap-2">
                                <Search className="h-8 w-8 opacity-20" />
                                <p className="text-sm">No items found</p>
                            </div>
                        )}
                    </div>
                </div>

                <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                    <DialogContent className="glass-card">
                        <DialogHeader>
                            <DialogTitle>New Message</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {availableUsers.map(u => (
                                <div key={u._id} onClick={() => startChat(u._id)} className="flex items-center gap-3 p-3 hover:bg-background rounded-lg cursor-pointer transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                        {getInitials(u.name)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-gray-900">{u.name}</p>
                                        <p className="text-xs text-gray-500">{u.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Chat Area */}
            <div className="flex-1 glass-card border border-white/40 shadow-xl flex flex-col overflow-hidden relative">
                {activeConversationId ? (
                    <>
                        <div className="h-16 border-b border-gray-100/50 flex items-center justify-between px-6 bg-white/40 backdrop-blur-xl z-20">
                            <div className="flex items-center gap-3">
                                {activeConversation && (
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-sm shadow-sm ring-2 ring-white">
                                        {getInitials(getConversationName(activeConversation))}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-gray-900 leading-tight">{activeConversation ? getConversationName(activeConversation) : 'Chat'}</h3>
                                    {activeConversation?.type === 'Group' && <p className="text-[10px] text-gray-500 font-medium">{activeConversation.participants.length} Members</p>}
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleClearHistory} className="text-red-600">Clear History</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {messages.map(msg => {
                                const isMe = msg.sender === userId;
                                return (
                                    <motion.div
                                        key={msg._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'}`}>
                                            {msg.content}
                                            <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-white/40 backdrop-blur-md border-t border-gray-100/50 z-20">
                            <form onSubmit={handleSendMessage} className="flex gap-3">
                                <input
                                    className="flex-1 bg-white rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                />
                                <Button type="submit" size="icon" disabled={!newMessage.trim()} className="rounded-full bg-primary hover:bg-green-600">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-2">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center"><UserIcon className="w-8 h-8 text-gray-300" /></div>
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}

