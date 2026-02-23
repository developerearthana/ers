"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";



import { useState } from "react";

export default function AppShell({ children, userRole, userPermissions, user, company }: { children: React.ReactNode, userRole?: string | null, userPermissions?: string[], user?: any, company?: any }) {
    const pathname = usePathname();
    const isAuthPage = pathname === "/login" || pathname === "/register";
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-background">
            {!isAuthPage && (
                <Sidebar
                    userRole={userRole}
                    userPermissions={userPermissions}
                    isCollapsed={isCollapsed}
                    toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                    company={company}
                />
            )}
            <div
                className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${!isAuthPage ? (isCollapsed ? "md:pl-20" : "md:pl-72") : ""
                    }`}
            >
                {!isAuthPage && <Header user={user} />}
                <main className="flex-1 p-6 md:p-8 pt-6 animate-in-fade-slide">
                    {children}
                </main>
            </div>
        </div>
    );
}
