"use client";

import TodoList from "@/components/activity/TodoList";
import { PageWrapper } from "@/components/ui/page-wrapper";

export default function TodoPage() {
    return (
        <PageWrapper className="h-[calc(100vh-120px)] p-4 max-w-7xl mx-auto">
            <TodoList />
        </PageWrapper>
    );
}
