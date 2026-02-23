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
    Leaf
} from "lucide-react"
import { cn } from "@/lib/utils"

const textStyle = "text-sm font-medium tracking-wide";

export const navItems = [
    // Super Admin: All modules
    // Permissions: '*' means all.
    // Otherwise check exact permission string match.

    // Dashboard
    { name: "Master Dashboard", href: "/", icon: LayoutDashboard, permission: 'dashboard' },

    // Vendor Specific
    // Vendor Specific
    // { name: "Vendor Dashboard", href: "/dashboards/vendor", icon: LayoutDashboard, permission: 'vendor-dash' },

    // Customer Specific
    // { name: "Client Dashboard", href: "/dashboards/customer", icon: LayoutDashboard, permission: 'customer-dash' },

    // Internal Modules
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
    { name: "HRM", href: "/hrm", icon: UserPlus, permission: 'hrm' },
    { name: "Assets", href: "/assets", icon: Monitor, permission: 'assets' },
    { name: "Masters", href: "/masters", icon: Settings, permission: 'masters' },
    { name: "Admin", href: "/admin", icon: ShieldCheck, permission: 'admin' },
]

import { ChevronLeft, ChevronRight, Menu } from "lucide-react"

// ... imports remain same ...

export function Sidebar({
    userRole,
    userPermissions = [],
    isCollapsed = false,
    toggleCollapse,
    company
}: {
    userRole?: string | null,
    userPermissions?: string[],
    isCollapsed?: boolean,
    toggleCollapse?: () => void,
    company?: any
}) {
    const pathname = usePathname()

    // Filter items based on role AND permissions
    const filteredNavItems = navItems.filter(item => {
        if (userRole === 'super-admin') return true;
        if (userPermissions?.includes('*')) return true;
        if (userPermissions?.includes(item.permission)) return true;
        return false;
    });

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-50 hidden md:flex flex-col transition-all duration-300 ease-in-out",
                isCollapsed ? "w-20" : "w-72"
            )}
        >
            {/* Glass Container */}
            <div className="glass-2 m-3 h-[calc(100vh-24px)] flex flex-col rounded-2xl border border-white/40 shadow-xl relative overflow-hidden transition-all duration-300">

                {/* Collapse Toggle Button */}
                <button
                    onClick={toggleCollapse}
                    className="absolute -right-3 top-8 z-50 p-1 bg-white border border-gray-200 rounded-full shadow-md text-gray-500 hover:text-primary transition-colors hidden md:flex"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                {/* Brand Header */}
                <div className={cn(
                    "flex items-center gap-3 px-4 py-6 border-b border-white/20 transition-all duration-300",
                    isCollapsed ? "justify-center" : "justify-start px-6"
                )}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-emerald-500/20 text-white overflow-hidden">
                        {company?.iconLogo ? (
                            <img src={company.iconLogo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <Leaf className="h-6 w-6" />
                        )}
                    </div>

                    <div className={cn(
                        "transition-all duration-300 overflow-hidden whitespace-nowrap",
                        isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                    )}>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">Earthana</h2>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{userRole || 'Guest'}</p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar overflow-x-hidden">
                    <nav className="grid gap-1.5">
                        {filteredNavItems.map((item, index) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                            // Rename "Master Dashboard" to "Dashboard" for non-super-admins
                            const displayName = (item.href === '/' && userRole !== 'super-admin') ? 'Dashboard' : item.name;

                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    title={isCollapsed ? displayName : ""}
                                    className={cn(
                                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ease-in-out relative",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-semibold"
                                            : "text-muted-foreground hover:bg-primary/5 hover:text-primary hover:shadow-sm",
                                        isCollapsed && "justify-center px-1"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "h-5 w-5 transition-transform group-hover:scale-110 shrink-0",
                                        isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"
                                    )} />

                                    <span className={cn(
                                        textStyle,
                                        "transition-all duration-300 overflow-hidden whitespace-nowrap",
                                        isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
                                    )}>
                                        {displayName}
                                    </span>

                                    {isActive && !isCollapsed && (
                                        <div className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse" />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Footer User Profile Summary */}
                <div className="p-4 border-t border-border/40">
                    <div className={cn(
                        "rounded-xl bg-card p-2 flex items-center gap-3 border border-border shadow-sm transition-all overflow-hidden",
                        isCollapsed ? "justify-center" : ""
                    )}>
                        <div className="h-8 w-8 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                            A
                        </div>
                        <div className={cn(
                            "flex flex-col transition-all duration-300 overflow-hidden whitespace-nowrap",
                            isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                        )}>
                            <span className="text-xs font-bold text-foreground">Admin User</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
