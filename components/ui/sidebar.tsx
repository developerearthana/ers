"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Calendar,
    Users,
    DollarSign,
    Megaphone,
    BookOpen,
    ShoppingCart,
    Package,
    UserPlus,
    Settings,
    BarChart3,
    Briefcase,
    ClipboardList,
    Monitor,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    UserCheck,
    CalendarDays
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/ui/logo"
import { useState, useEffect } from "react"

const textStyle = "text-sm font-medium tracking-wide";

export const navItems = [
    { name: "Master Dashboard", href: "/", icon: LayoutDashboard, permission: 'dashboard' },
    { name: "Activity", href: "/activity", icon: Calendar, permission: 'activity' },
    { name: "Goals", href: "/goals", icon: BarChart3, permission: 'goals' },
    { name: "Contacts", href: "/contacts", icon: Users, permission: 'contacts' },
    { name: "Sales", href: "/sales", icon: DollarSign, permission: 'sales' },
    { name: "Marketing", href: "/marketing", icon: Megaphone, permission: 'marketing' },
    { name: "Projects", href: "/projects", icon: Briefcase, permission: 'projects' },
    { name: "Work Orders", href: "/work-orders", icon: ClipboardList, permission: 'work-orders' },
    { name: "Accounting", href: "/accounts", icon: BookOpen, permission: 'accounting' },
    { name: "Purchase", href: "/purchase", icon: ShoppingCart, permission: 'purchase' },
    { name: "Inventory", href: "/inventory", icon: Package, permission: 'inventory' },
    { name: "HRM Admin", href: "/hrm", icon: UserPlus, permission: 'hrm' },
    { name: "Attendance", href: "/hrm/attendance", icon: UserCheck, permission: 'basic-hrm' },
    { name: "Leave", href: "/hrm/leave", icon: CalendarDays, permission: 'basic-hrm' },
    { name: "Assets", href: "/assets", icon: Monitor, permission: 'assets' },
    { name: "Masters", href: "/masters", icon: Settings, permission: 'masters' },
    { name: "Admin", href: "/admin", icon: ShieldCheck, permission: 'admin' },
]

export function Sidebar({
    userRole,
    userPermissions = [],
    isCollapsed = false,
    toggleCollapse,
    company,
    user,
}: {
    userRole?: string | null,
    userPermissions?: string[],
    isCollapsed?: boolean,
    toggleCollapse?: () => void,
    company?: any,
    user?: any,
}) {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    // Close mobile menu on ESC
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false) }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [])

    // Filter items based on role AND permissions
    const filteredNavItems = navItems.filter(item => {
        if (item.permission === 'basic-hrm') return true; // Always allow punch in and leave

        if (userRole === 'super-admin') return true;
        if (userPermissions?.includes('*')) return true;
        if (userPermissions?.includes(item.permission)) return true;
        return false;
    });

    const NavContent = ({ collapsed = false }: { collapsed?: boolean }) => (
        <>
            {/* Brand Header */}
            <div className={cn(
                "flex border-b border-white/20 transition-all duration-300",
                collapsed ? "items-center justify-center gap-3 px-4 py-6" : "flex-col items-start gap-1 px-6 py-4"
            )}>
                <div className={cn(
                    "flex shrink-0 items-center justify-center transition-all duration-300 overflow-visible",
                    collapsed ? "h-10 w-10" : "h-12 w-full max-w-[220px]"
                )}>
                    {company?.fullLogo && !collapsed ? (
                        <img
                            src={company.fullLogo}
                            alt="Company Logo"
                            className="w-full h-full object-contain"
                        />
                    ) : company?.iconLogo ? (
                        <img
                            src={company.iconLogo}
                            alt="Company Logo"
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <Logo
                            variant={collapsed ? "icon" : "full"}
                            className={cn("transition-all duration-300", collapsed ? "h-10 w-10" : "h-12 w-full")}
                        />
                    )}
                </div>

                <div className={cn(
                    "transition-all duration-300 overflow-hidden whitespace-nowrap",
                    collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{userRole || 'Guest'}</p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar overflow-x-hidden">
                <nav className="grid gap-1.5">
                    {filteredNavItems.map((item, index) => {
                        const isSuperAdmin = userRole === 'super-admin';
                        const isEmployeeArea = pathname?.startsWith('/dashboards/employee');
                        
                        let itemHref = item.href;
                        let displayName = item.name;

                        // Make sure the Dashboard link points to the right place
                        if (item.href === '/') {
                            if (isSuperAdmin) {
                                itemHref = '/dashboards/super-admin';
                            } else {
                                itemHref = '/dashboards/employee';
                                displayName = 'Dashboard';
                            }
                        }

                        const isActive = pathname === itemHref || (itemHref !== '/' && pathname?.startsWith(itemHref));

                        return (
                            <Link
                                key={index}
                                href={itemHref}
                                title={collapsed ? displayName : ""}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ease-in-out relative",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-semibold"
                                        : "text-muted-foreground hover:bg-primary/5 hover:text-primary hover:shadow-sm",
                                    collapsed && "justify-center px-1"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5 transition-transform group-hover:scale-110 shrink-0",
                                    isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"
                                )} />

                                <span className={cn(
                                    textStyle,
                                    "transition-all duration-300 overflow-hidden whitespace-nowrap",
                                    collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
                                )}>
                                    {displayName}
                                </span>

                                {isActive && !collapsed && (
                                    <div className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse" />
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </div>

        </>
    )

    return (
        <>
            {/* ─── Mobile Hamburger Button ─── */}
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed top-4 left-4 z-50 md:hidden p-2 bg-card border border-border rounded-xl shadow-lg text-foreground hover:bg-muted transition-colors"
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* ─── Mobile Overlay ─── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ─── Mobile Sidebar Drawer ─── */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 md:hidden flex flex-col transform transition-transform duration-300 ease-in-out",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="glass-2 m-3 h-[calc(100vh-24px)] flex flex-col rounded-2xl border border-white/40 shadow-xl relative overflow-hidden">
                    {/* Close button */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="absolute right-3 top-3 z-50 p-1.5 bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <NavContent collapsed={false} />
                </div>
            </aside>

            {/* ─── Desktop Sidebar ─── */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 hidden md:flex flex-col transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-20" : "w-72"
                )}
            >
                <div className="glass-2 m-3 h-[calc(100vh-24px)] flex flex-col rounded-2xl border border-white/40 shadow-xl relative overflow-hidden transition-all duration-300">
                    {/* Collapse Toggle Button */}
                    <button
                        onClick={toggleCollapse}
                        className="absolute -right-3 top-8 z-50 p-1 bg-white border border-gray-200 rounded-full shadow-md text-gray-500 hover:text-primary transition-colors hidden md:flex"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>

                    <NavContent collapsed={isCollapsed} />
                </div>
            </aside>
        </>
    )
}
