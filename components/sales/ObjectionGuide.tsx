"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { BookOpen, PhoneCall, ShieldAlert, DollarSign, Clock, Users } from "lucide-react";

export default function ObjectionGuide() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 border-dashed border-primary/40 text-primary hover:bg-primary/5">
                    <BookOpen className="w-4 h-4" />
                    Sales Playbook
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-primary" />
                        Objection Handling Guide
                    </SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    <div className="bg-white p-4 rounded-lg border border-border">
                        <h4 className="font-semibold text-blue-900 mb-2">💡 Golden Rule</h4>
                        <p className="text-sm text-blue-800">
                            Listen → Empathize → Clarify → Isolate → Respond → Check.
                            Never argue. Treat an objection as a request for more information.
                        </p>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                        {/* 1. Price Objection */}
                        <AccordionItem value="price">
                            <AccordionTrigger className="hover:no-underline hover:bg-background px-2 rounded-lg">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="p-2 bg-red-100 text-red-600 rounded-lg"><DollarSign className="w-4 h-4" /></div>
                                    <div>
                                        <div className="font-semibold text-gray-900">"It's too expensive"</div>
                                        <div className="text-xs text-muted-foreground">Price / Budget issues</div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-2 pt-2 text-gray-600 space-y-3">
                                <p className="italic text-sm">"I understand budget is a major factor. Let's put price aside for a moment - does the solution actually solve the problem you're facing?"</p>
                                <div className="bg-background p-3 rounded text-sm border-l-4 border-primary">
                                    <strong>Response Strategy:</strong>
                                    <ul className="list-disc ml-4 mt-1 space-y-1">
                                        <li>Pivot from Cost to ROI (Value).</li>
                                        <li>Break down the cost (cost of NOT acting).</li>
                                        <li>Ask: "Too expensive compared to what?"</li>
                                    </ul>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* 2. Timing Objection */}
                        <AccordionItem value="timing">
                            <AccordionTrigger className="hover:no-underline hover:bg-background px-2 rounded-lg">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Clock className="w-4 h-4" /></div>
                                    <div>
                                        <div className="font-semibold text-gray-900">"Not the right time"</div>
                                        <div className="text-xs text-muted-foreground">Timing / Delays</div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-2 pt-2 text-gray-600 space-y-3">
                                <p className="italic text-sm">"I hear you. Just so I understand, what specifically needs to change between now and then for this to be a priority?"</p>
                                <div className="bg-background p-3 rounded text-sm border-l-4 border-primary">
                                    <strong>Response Strategy:</strong>
                                    <ul className="list-disc ml-4 mt-1 space-y-1">
                                        <li>Highlight urgency/scarcity if real.</li>
                                        <li>Propose a timeline to implement later, but decide now.</li>
                                        <li>Ask: "If we wait 6 months, how much will that cost you in [problem]?"</li>
                                    </ul>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* 3. Authority Objection */}
                        <AccordionItem value="authority">
                            <AccordionTrigger className="hover:no-underline hover:bg-background px-2 rounded-lg">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Users className="w-4 h-4" /></div>
                                    <div>
                                        <div className="font-semibold text-gray-900">"I need to check with..."</div>
                                        <div className="text-xs text-muted-foreground">Authority / Decision Maker</div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-2 pt-2 text-gray-600 space-y-3">
                                <p className="italic text-sm">"Of course. Who else is involved in the decision? It might make sense for me to share this with them directly to save you the back-and-forth."</p>
                                <div className="bg-background p-3 rounded text-sm border-l-4 border-primary">
                                    <strong>Response Strategy:</strong>
                                    <ul className="list-disc ml-4 mt-1 space-y-1">
                                        <li>Validate their role, but ask for the process.</li>
                                        <li>Treat them as a champion, equip them with data.</li>
                                        <li>Ask: "What do you think their main concern will be?"</li>
                                    </ul>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* 4. Competitor Objection */}
                        <AccordionItem value="competitor">
                            <AccordionTrigger className="hover:no-underline hover:bg-background px-2 rounded-lg">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="p-2 bg-green-100 text-green-600 rounded-lg"><ShieldAlert className="w-4 h-4" /></div>
                                    <div>
                                        <div className="font-semibold text-gray-900">"We use someone else"</div>
                                        <div className="text-xs text-muted-foreground">Competitor / Switching</div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-2 pt-2 text-gray-600 space-y-3">
                                <p className="italic text-sm">"That's great. [Competitor] is a good company. How long have you been with them? Is there anything you wish they did differently?"</p>
                                <div className="bg-background p-3 rounded text-sm border-l-4 border-primary">
                                    <strong>Response Strategy:</strong>
                                    <ul className="list-disc ml-4 mt-1 space-y-1">
                                        <li>Don't bash the competition.</li>
                                        <li>Find the gap (what they are missing).</li>
                                        <li>Focus on your unique value prop.</li>
                                    </ul>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <div className="pt-4 border-t">
                        <h4 className="font-semibold text-gray-900 mb-2">📞 Follow-up Scripts</h4>
                        <div className="space-y-2 text-xs text-gray-600">
                            <div className="p-2 bg-background rounded">
                                <strong>The "Gentle Nudge":</strong> "Hi [Name], just floating this to the top of your inbox. Any thoughts on the proposal?"
                            </div>
                            <div className="p-2 bg-background rounded">
                                <strong>The "Value Add":</strong> "Hi [Name], saw this article about [Industry Trend] and thought of our conversation..."
                            </div>
                            <div className="p-2 bg-background rounded">
                                <strong>The "Break-up":</strong> "Hi [Name], haven't heard back, so I assume this isn't a priority right now. I'll close this file for now."
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

