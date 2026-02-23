"use client";

import ChatInterface from "@/components/activity/ChatInterface";
import { PageWrapper } from "@/components/ui/page-wrapper";

export default function ChatPage() {
    return (
        <PageWrapper className="h-[calc(100vh-120px)] p-4 max-w-7xl mx-auto">
            <ChatInterface />
        </PageWrapper>
    );
}
