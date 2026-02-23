"use client";

import { useState } from 'react';
import { Sparkles, MessageSquare, Mail, Terminal, Send, Copy, RefreshCw, ChevronDown, Check, Zap, Bot, Share2, ThumbsUp, TrendingUp, Image as ImageIcon } from 'lucide-react';
import { PageWrapper, CardWrapper } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { generateAIContent } from '@/app/actions/ai';

export default function AIContentPage() {
    const [activeTab, setActiveTab] = useState('viral-posts');
    const [isGenerating, setIsGenerating] = useState(false);

    // Rich Result State
    const [generatedResult, setGeneratedResult] = useState<any>(null);

    // Input States
    const [viralInput, setViralInput] = useState({ topic: '', genre: 'None', language: 'English', type: 'Any' });
    const [replyInput, setReplyInput] = useState({ original: '', context: '', thoughts: '', strategy: 'Professional & Insightful', refine: false });
    const [advancedInput, setAdvancedInput] = useState({
        lighting: 'Cinematic High-Key',
        motion: 'Smooth Pan/Tilt',
        clipLength: '30s (Short)',
        channel: 'Instagram/TikTok',
        visualStyle: 'Photorealistic',
        cognitiveFramework: 'Chain of Thought',
        brandTone: 'Premium'
    });
    const [emailInput, setEmailInput] = useState({ recipient: '', topic: '', tone: 'Formal', notes: '', template: 'None' });
    const [promptInput, setPromptInput] = useState({ territory: 'Product Marketing', archetype: 'Strategist', role: 'Strategic Consult', parameters: '', template: 'None' });

    const genres = ["None", "Tech", "Lifestyle", "Business", "Health", "Motivation"];
    const styles = [
        "Any", // Default
        "Urgency & Curiosity", "Smart & Savvy", "Storytelling", "Humorous",
        "Technical", "Architectural", "Agentic", "Academic", "Luxury/High-End",
        "Direct/Aggressive", "Empathetic", "Fun & Quirky", "Promise", "Questions", "Numbers & Power Words"
    ];

    const [selectedStyles, setSelectedStyles] = useState<string[]>(['Any']);

    const toggleStyle = (style: string) => {
        if (style === 'Any') {
            setSelectedStyles(['Any']);
            return;
        }

        let newStyles = selectedStyles.filter(s => s !== 'Any');

        if (newStyles.includes(style)) {
            newStyles = newStyles.filter(s => s !== style);
        } else {
            if (newStyles.length < 3) {
                newStyles = [...newStyles, style];
            } else {
                toast.warning("Select up to 3 styles");
                return;
            }
        }

        if (newStyles.length === 0) newStyles = ['Any'];
        setSelectedStyles(newStyles);
    };

    const handleGenerate = async (type: 'Post' | 'Reply' | 'Email' | 'Strategy') => {
        setIsGenerating(true);
        let data = {};

        if (type === 'Post') data = { ...viralInput, styles: selectedStyles };
        if (type === 'Reply') data = replyInput;
        if (type === 'Email') data = emailInput;
        if (type === 'Strategy') data = promptInput;

        try {
            const res = await generateAIContent(type, data);
            if (res.success && res.data) {
                // Determine what to display based on richResult or standard content
                const aiData = res.data as any;
                setGeneratedResult(aiData.richResult || { content: aiData.generatedContent || aiData });
                toast.success("Content Generated Successfully!");
            } else {
                toast.error("Failed to generate content");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const handlePromptTemplateChange = (template: string) => {
        setPromptInput(prev => ({ ...prev, template }));
        // Auto-fill logic
        if (template === 'Financial Management') setPromptInput(prev => ({ ...prev, territory: 'Finance', archetype: 'CFO', role: 'Financial Strategy', parameters: 'Optimize Cash Flow' }));
        if (template === 'Product Marketing') setPromptInput(prev => ({ ...prev, territory: 'Marketing', archetype: 'Product Marketer', role: 'Go-to-Market Strategy', parameters: 'Launch Positioning' }));
        if (template === 'Video Production') setPromptInput(prev => ({ ...prev, territory: 'Creative', archetype: 'Director', role: 'Visual Storytelling', parameters: 'Cinematic Engagement' }));
        if (template === 'Software Development') setPromptInput(prev => ({ ...prev, territory: 'Engineering', archetype: 'CTO', role: 'Tech Architecture', parameters: 'Scalable Microservices' }));
        if (template === 'Sales Department') setPromptInput(prev => ({ ...prev, territory: 'Sales', archetype: 'VP Sales', role: 'Revenue Ops', parameters: 'Pipeline Velocity' }));
    };

    return (
        <PageWrapper className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 flex items-center gap-2">
                        <Bot className="w-8 h-8 text-blue-600" /> Smart Content Generator
                    </h1>
                    <p className="text-gray-500 mt-1">Create engaging content, replies, and emails instantly.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => { setGeneratedResult(null); toast.info("Reset"); }}>
                        <RefreshCw className="w-4 h-4" /> Reset
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="viral-posts" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="bg-white/50 border border-gray-200 p-1 h-auto rounded-xl inline-flex shadow-sm">
                    <TabsTrigger value="viral-posts" className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all gap-2">
                        <Zap className="w-4 h-4" /> Viral Posts
                    </TabsTrigger>
                    <TabsTrigger value="smart-replies" className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all gap-2">
                        <MessageSquare className="w-4 h-4" /> Smart Replies
                    </TabsTrigger>
                    <TabsTrigger value="email-writer" className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all gap-2">
                        <Mail className="w-4 h-4" /> Email Writer
                    </TabsTrigger>
                    <TabsTrigger value="prompt-builder" className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-pink-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all gap-2">
                        <Terminal className="w-4 h-4" /> Prompt Builder
                    </TabsTrigger>
                </TabsList>

                {/* VIRAL POSTS */}
                <TabsContent value="viral-posts" className="mt-6">
                    <div className="grid lg:grid-cols-12 gap-6">
                        {/* INPUT COLUMN */}
                        <div className="lg:col-span-4 space-y-6">
                            <CardWrapper className="glass-card p-6 rounded-2xl border-border bg-white/30 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Topic / Idea</label>
                                    <Input
                                        placeholder="e.g., 'Future of AI', 'Morning Routine'"
                                        className="bg-white border-gray-200"
                                        value={viralInput.topic}
                                        onChange={(e) => setViralInput({ ...viralInput, topic: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-600">Genre</label>
                                        <Select value={viralInput.genre} onValueChange={(v) => setViralInput({ ...viralInput, genre: v })}>
                                            <SelectTrigger className="bg-white border-gray-200"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-600">Language</label>
                                        <Select value={viralInput.language} onValueChange={(v) => setViralInput({ ...viralInput, language: v })}>
                                            <SelectTrigger className="bg-white border-gray-200"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="English">English</SelectItem>
                                                <SelectItem value="Tamil">Tamil</SelectItem>
                                                <SelectItem value="Spanish">Spanish</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Content Type</label>
                                    <Select value={viralInput.type} onValueChange={(v) => setViralInput({ ...viralInput, type: v })}>
                                        <SelectTrigger className="bg-white border-gray-200"><SelectValue /></SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            <SelectItem value="Any">Any</SelectItem>
                                            <SelectItem value="Data-Driven/Analytical">Data-Driven/Analytical</SelectItem>
                                            <SelectItem value="Resource/Reference">Resource/Reference</SelectItem>
                                            <SelectItem value="Persuasive/Opinion">Persuasive/Opinion</SelectItem>
                                            <SelectItem value="Promotional/Marketing">Promotional/Marketing</SelectItem>
                                            <SelectItem value="Review/Evaluation">Review/Evaluation</SelectItem>
                                            <SelectItem value="Inspirational">Inspirational</SelectItem>
                                            <SelectItem value="Interactive">Interactive</SelectItem>
                                            <SelectItem value="Storytelling/Narrative">Storytelling/Narrative</SelectItem>
                                            <SelectItem value="Entertaining">Entertaining</SelectItem>
                                            <SelectItem value="Educational">Educational</SelectItem>
                                            <SelectItem value="Timely (News/Informational)">Timely (News/Informational)</SelectItem>
                                            <SelectItem value="Instructive/How-To">Instructive/How-To</SelectItem>
                                            <SelectItem value="Explanatory/Evergreen">Explanatory/Evergreen</SelectItem>
                                            <SelectItem value="Motivational">Motivational</SelectItem>
                                            <SelectItem value="Funny">Funny</SelectItem>
                                            <SelectItem value="Trend">Trend</SelectItem>
                                            <SelectItem value="Latest Regional News">Latest Regional News</SelectItem>
                                            <SelectItem value="Comparison Chart">Comparison Chart</SelectItem>
                                            <SelectItem value="YouTube Video Script">YouTube Video Script</SelectItem>
                                            <SelectItem value="Antigravity Artifact">Antigravity Artifact</SelectItem>
                                            <SelectItem value="System Architecture">System Architecture</SelectItem>
                                            <SelectItem value="Product Showcase">Product Showcase</SelectItem>
                                            <SelectItem value="Brand Story">Brand Story</SelectItem>
                                            <SelectItem value="Ad Campaign">Ad Campaign</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-600">Writing Style (Select up to 3)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {styles.map(style => (
                                            <div
                                                key={style}
                                                onClick={() => toggleStyle(style)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border transition-all select-none",
                                                    selectedStyles.includes(style)
                                                        ? "bg-purple-100 border-purple-300 text-purple-700 shadow-sm"
                                                        : "bg-white border-gray-200 text-gray-600 hover:bg-background"
                                                )}
                                            >
                                                {style}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    onClick={() => handleGenerate('Post')}
                                    disabled={isGenerating}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white h-12 text-lg font-bold shadow-lg shadow-purple-200"
                                >
                                    {isGenerating ? "Generating..." : <><Sparkles className="w-5 h-5 mr-2" /> Generate 5 Variations</>}
                                </Button>
                            </CardWrapper>
                        </div>

                        {/* RESULT COLUMN */}
                        <div className="lg:col-span-8">
                            <div className="glass-card p-0 rounded-2xl overflow-hidden flex flex-col min-h-[600px] border-border bg-white/60">

                                {/* If we have options but no final selection yet */}
                                {generatedResult?.options && !generatedResult.selectedOption ? (
                                    <div className="flex-1 p-6 space-y-6">
                                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-purple-600" /> Select the Best Option
                                        </h3>
                                        <div className="grid gap-4">
                                            {generatedResult.options.map((opt: any) => (
                                                <div key={opt.id} className="bg-white p-5 rounded-xl border border-border shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group" onClick={() => {
                                                    setGeneratedResult({ ...generatedResult, selectedOption: opt, imageUrl: `https://source.unsplash.com/800x800/?${viralInput.topic || 'business'},abstract` });
                                                    toast.success("Option Selected! Generating Image...");
                                                }}>
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                            {opt.style}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-green-600 font-bold text-sm">
                                                            <TrendingUp className="w-4 h-4" /> {opt.viralRating}/10
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-700 whitespace-pre-wrap line-clamp-3 group-hover:line-clamp-none transition-all">{opt.content}</p>
                                                    <Button size="sm" className="mt-4 w-full bg-white text-purple-600 border border-purple-200 hover:bg-white group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                                        Select & Generate Image
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : generatedResult?.selectedOption ? (
                                    /* FINAL RESULT VIEW */
                                    <div className="flex flex-col h-full">
                                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/50">
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => setGeneratedResult({ ...generatedResult, selectedOption: null })}>← Back</Button>
                                                <h3 className="font-bold text-gray-700">Selected Content</h3>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-purple-600" onClick={() => handleCopy(generatedResult.selectedOption.content)}><Copy className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-purple-600"><Share2 className="w-4 h-4" /></Button>
                                            </div>
                                        </div>

                                        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto bg-white/40">
                                            {/* Rating Card */}
                                            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center gap-2 font-bold text-lg"><TrendingUp className="w-5 h-5" /> Viral Potential</div>
                                                    <div className="text-3xl font-black">{generatedResult.selectedOption.viralRating}</div>
                                                </div>
                                                <Progress value={parseFloat(generatedResult.selectedOption.viralRating) * 10} className="h-3 mb-3 bg-black/20" indicatorClassName="bg-white transition-all duration-1000" />
                                                <p className="text-sm text-purple-100 opacity-90">{generatedResult.selectedOption.viralExplanation}</p>
                                            </div>

                                            {/* Text Content */}
                                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                                <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">{generatedResult.selectedOption.content}</p>
                                            </div>

                                            {/* Image */}
                                            <div>
                                                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Generated Visual</h4>
                                                <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-md group w-full aspect-video bg-white">
                                                    {generatedResult.imageUrl ? (
                                                        <>
                                                            <img src={generatedResult.imageUrl} alt="Generated Visual" className="w-full h-full object-cover" />
                                                            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-md text-white text-xs font-bold uppercase tracking-wider">
                                                                Earthana
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-gray-400">Generating Image...</div>
                                                    )}
                                                </div>
                                            </div>

                                            <Button className="w-full h-12 text-lg" onClick={() => toast.success("Shared successfully!")}>
                                                <Share2 className="w-5 h-5 mr-2" /> Share Post
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    /* START STATE */
                                    <div className="text-center text-gray-400 space-y-4 my-auto h-full flex flex-col items-center justify-center">
                                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-purple-300 mb-4">
                                            <Zap className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-xl font-medium text-gray-600">Viral Content Generator</h3>
                                        <p className="text-sm max-w-sm mx-auto">Configure your topic and settings on the left to generate 5 optimized variations.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* SMART REPLIES */}
                <TabsContent value="smart-replies" className="mt-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                        <CardWrapper className="glass-card p-6 rounded-2xl border-border bg-white/30 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Original Post</label>
                                    <Textarea
                                        placeholder="Paste content..."
                                        className="bg-white border-gray-200 min-h-[100px]"
                                        value={replyInput.original}
                                        onChange={(e) => setReplyInput({ ...replyInput, original: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">Reply Strategy</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {["Professional & Insightful", "Short & Punchy", "Collaborative", "Growth Mindset"].map(s => (
                                            <div
                                                key={s}
                                                onClick={() => setReplyInput({ ...replyInput, strategy: s })}
                                                className={cn(
                                                    "p-3 rounded-xl border cursor-pointer transition-all text-sm font-medium",
                                                    replyInput.strategy === s
                                                        ? "bg-blue-100 border-blue-300 text-blue-700 ring-1 ring-blue-300"
                                                        : "bg-white border-gray-200 text-gray-600 hover:bg-background"
                                                )}
                                            >
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <div
                                        onClick={() => setReplyInput(prev => ({ ...prev, refine: !prev.refine }))}
                                        className={cn(
                                            "w-10 h-5 rounded-full relative cursor-pointer transition-colors",
                                            replyInput.refine ? "bg-blue-600" : "bg-white"
                                        )}
                                    >
                                        <div className={cn("w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all", replyInput.refine ? "left-5.5" : "left-0.5")} />
                                    </div>
                                    <label className="text-sm text-gray-600 cursor-pointer" onClick={() => setReplyInput(prev => ({ ...prev, refine: !prev.refine }))}>Optimize for Social Media (Hashtags, etc)</label>
                                </div>

                                <Button
                                    onClick={() => handleGenerate('Reply')}
                                    disabled={isGenerating}
                                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white h-12 text-lg font-bold shadow-lg shadow-blue-200"
                                >
                                    Generate Reply
                                </Button>
                            </div>
                        </CardWrapper>

                        <div className="glass-card p-0 rounded-2xl overflow-hidden flex flex-col min-h-[400px] border-border bg-white/60">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/50">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-blue-600" /> Generated Reply</h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={() => generatedResult && handleCopy(generatedResult.content)}><Copy className="w-4 h-4" /></Button>
                            </div>
                            <div className="flex-1 p-8 flex items-center justify-center bg-white/40">
                                {generatedResult ? (
                                    <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">{generatedResult.content}</p>
                                ) : (
                                    <div className="text-center text-gray-400">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30 text-blue-300" />
                                        <p>Select a strategy and generate.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* EMAIL WRITER */}
                <TabsContent value="email-writer" className="mt-6">
                    <div className="grid lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-4 space-y-6 glass-card p-6 rounded-2xl border-teal-100 bg-teal-50/30 h-fit">
                            <h3 className="font-bold text-lg text-teal-700 flex items-center gap-2 mb-4"><Mail className="w-5 h-5" /> Draft Settings</h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Templates (Optional)</label>
                                    <Select value={emailInput.template} onValueChange={(v) => setEmailInput({ ...emailInput, template: v })}>
                                        <SelectTrigger className="bg-white border-gray-200"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="None">None</SelectItem>
                                            <SelectItem value="Project Kickoff">Project Kickoff</SelectItem>
                                            <SelectItem value="Invoice Follow-up">Invoice Follow-up</SelectItem>
                                            <SelectItem value="Meeting Request">Meeting Request</SelectItem>
                                            <SelectItem value="Client Update">Client Update</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Recipient Name</label>
                                    <Input className="bg-white border-gray-200" placeholder="Team/Stakeholders" value={emailInput.recipient} onChange={(e) => setEmailInput({ ...emailInput, recipient: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Topic / Purpose</label>
                                    <Input className="bg-white border-gray-200" placeholder="Weekly Update" value={emailInput.topic} onChange={(e) => setEmailInput({ ...emailInput, topic: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Tone</label>
                                    <Select value={emailInput.tone} onValueChange={(v) => setEmailInput({ ...emailInput, tone: v })}>
                                        <SelectTrigger className="bg-white border-gray-200"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Formal">Formal</SelectItem>
                                            <SelectItem value="Casual">Casual</SelectItem>
                                            <SelectItem value="Urgent">Urgent</SelectItem>
                                            <SelectItem value="Empathetic">Empathetic</SelectItem>
                                            <SelectItem value="Authoritative">Authoritative</SelectItem>
                                            <SelectItem value="Appreciative">Appreciative</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button onClick={() => handleGenerate('Email')} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg shadow-teal-200">
                                    Generate Draft
                                </Button>
                            </div>
                        </div>

                        <div className="lg:col-span-8 glass-card p-0 rounded-2xl overflow-hidden min-h-[600px] flex flex-col border-teal-100 bg-white">
                            <div className="p-4 border-b border-gray-100 bg-background flex justify-between items-center">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                    <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                                </div>
                                {generatedResult && (
                                    <Button size="sm" variant="outline" onClick={() => handleCopy(generatedResult.content)}>
                                        <Copy className="w-3 h-3 mr-2" /> Copy Text
                                    </Button>
                                )}
                            </div>
                            <div className="flex-1 p-10 flex items-center justify-center bg-background/30">
                                {generatedResult ? (
                                    <div className="w-full max-w-2xl text-gray-800 bg-white p-8 shadow-sm border border-gray-100 min-h-[400px]">
                                        <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed">{generatedResult.content}</p>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-400">
                                        <div className="bg-teal-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-teal-300">
                                            <Mail className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-xl font-medium text-gray-600 mb-2">Draft Workspace</h3>
                                        <p className="text-sm max-w-xs mx-auto">Fill details to generate email.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* PROMPT BUILDER */}
                <TabsContent value="prompt-builder" className="mt-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                        <CardWrapper className="glass-card p-8 rounded-2xl border-pink-100 bg-pink-50/10 space-y-6">
                            <h2 className="text-2xl font-bold font-mono tracking-tight text-pink-600 uppercase">Command Center</h2>

                            <div className="space-y-6 max-h-[800px] overflow-y-auto custom-scrollbar">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Department Template</label>
                                    <Select value={promptInput.template} onValueChange={handlePromptTemplateChange}>
                                        <SelectTrigger className="bg-white border-gray-200 font-mono"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="None">Custom</SelectItem>
                                            <SelectItem value="Financial Management">Financial Management</SelectItem>
                                            <SelectItem value="Product Marketing">Product Marketing</SelectItem>
                                            <SelectItem value="Video Production">Video Production</SelectItem>
                                            <SelectItem value="Software Development">Software Development</SelectItem>
                                            <SelectItem value="Sales Department">Sales Department</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="h-px bg-pink-200/50 my-2" />

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Territory</label>
                                    <Input className="bg-white border-gray-200 font-mono" placeholder="e.g. Finance" value={promptInput.territory} onChange={(e) => setPromptInput({ ...promptInput, territory: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Archetype</label>
                                    <Input className="bg-white border-gray-200 font-mono" placeholder="e.g. CFO" value={promptInput.archetype} onChange={(e) => setPromptInput({ ...promptInput, archetype: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Role</label>
                                    <Input className="bg-white border-gray-200 font-mono" placeholder="e.g. Strategic Advisor" value={promptInput.role} onChange={(e) => setPromptInput({ ...promptInput, role: e.target.value })} />
                                </div>

                                {/* MOVED VISUAL & MOTION SECTION */}
                                <div className="h-px bg-pink-200/50 my-2" />
                                <h4 className="text-xs font-bold text-pink-600 uppercase tracking-widest mb-4">Visual & Motion</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Lighting</label>
                                        <Select value={advancedInput.lighting} onValueChange={(v) => setAdvancedInput({ ...advancedInput, lighting: v })}>
                                            <SelectTrigger className="bg-white border-gray-200 h-9 text-xs"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Cinematic High-Key">Cinematic High-Key</SelectItem>
                                                <SelectItem value="Moody Low-Key">Moody Low-Key</SelectItem>
                                                <SelectItem value="Natural/Golden Hour">Natural/Golden Hour</SelectItem>
                                                <SelectItem value="Cyberpunk/Neon">Cyberpunk/Neon</SelectItem>
                                                <SelectItem value="Studio Clean">Studio Clean</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Motion</label>
                                        <Select value={advancedInput.motion} onValueChange={(v) => setAdvancedInput({ ...advancedInput, motion: v })}>
                                            <SelectTrigger className="bg-white border-gray-200 h-9 text-xs"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Static">Static</SelectItem>
                                                <SelectItem value="Smooth Pan/Tilt">Smooth Pan/Tilt</SelectItem>
                                                <SelectItem value="Slow Zoom In">Slow Zoom In</SelectItem>
                                                <SelectItem value="Dynamic Drone">Dynamic Drone</SelectItem>
                                                <SelectItem value="Handheld/Guerilla">Handheld/Guerilla</SelectItem>
                                                <SelectItem value="Tracking Shot">Tracking Shot</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* MOVED COGNITIVE MATRIX SECTION */}
                                <div className="h-px bg-pink-200/50 my-2" />
                                <h4 className="text-xs font-bold text-pink-600 uppercase tracking-widest mb-4">Cognitive Matrix</h4>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Cognitive Framework</label>
                                    <Select value={advancedInput.cognitiveFramework} onValueChange={(v) => setAdvancedInput({ ...advancedInput, cognitiveFramework: v })}>
                                        <SelectTrigger className="bg-white border-gray-200 h-9 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="None">None</SelectItem>
                                            <SelectItem value="Chain of Thought">Chain of Thought</SelectItem>
                                            <SelectItem value="Tree of Thought">Tree of Thought</SelectItem>
                                            <SelectItem value="Socratic Method">Socratic Method</SelectItem>
                                            <SelectItem value="Antigravity Loop (Plan-Execute-Verify)">Antigravity Loop (Plan-Execute-Verify)</SelectItem>
                                            <SelectItem value="Debate (Pro/Con)">Debate (Pro/Con)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    onClick={() => handleGenerate('Strategy')}
                                    disabled={isGenerating}
                                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold shadow-lg shadow-pink-200 mt-4"
                                >
                                    {isGenerating ? "Generating..." : <><Terminal className="w-5 h-5 mr-2" /> Build Prompt Strategy</>}
                                </Button>
                            </div>
                        </CardWrapper>

                        <div className="bg-white border-l-4 border-pink-500 rounded-r-2xl p-8 font-mono text-sm leading-relaxed overflow-hidden relative text-gray-300 shadow-2xl">
                            {generatedResult ? (
                                <div className="whitespace-pre-wrap animate-in fade-in zoom-in-95 duration-500">{generatedResult.content}</div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center opacity-50 space-y-4">
                                    <Terminal className="w-16 h-16 text-pink-500" />
                                    <p className="uppercase tracking-widest text-xs">Awaiting Command Input...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent >
            </Tabs >
        </PageWrapper >
    );
}

