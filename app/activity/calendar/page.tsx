"use client";

import CalendarView from "@/components/activity/CalendarView";
import { PageWrapper, CardWrapper } from "@/components/ui/page-wrapper";

export default function CalendarPage() {
    return (
        <PageWrapper>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Optional: Add summary stats here later if needed */}
                <CalendarView />
            </div>
        </PageWrapper>
    );
}
