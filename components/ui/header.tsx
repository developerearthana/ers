"use client"

import {
    Bell, Search, User, Menu,
    PieChart, Users, BarChart3, ShoppingCart, FileText, Settings,
    LayoutDashboard, List, Kanban, CheckSquare, Package, Tags, ArrowLeftRight, History,
    UserCheck, Banknote, CalendarDays, Briefcase, KeyRound
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { navItems } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { uploadFile } from "@/app/actions/upload";
import { updateProfile } from "@/app/actions/user-profile";
import { toast } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";

const breadcrumbNameMap: { [key: string]: string } = {
    masters: "Masters",
    company: "Company Profile",
    subsidiaries: "Subsidiaries",
    departments: "Departments",
    teams: "Teams",
    users: "User Types",
    activity: "Activity",
    documents: "Documents",
    calendar: "Calendar",
    chat: "Chat",
    todo: "Todo List",
    contacts: "Contacts",
    clients: "Clients",
    vendors: "Vendors",
    leads: "Leads",
    sales: "Sales",
    pipeline: "Pipeline",
    orders: "Orders",
    invoices: "Invoices",
    marketing: "Marketing",
    campaigns: "Campaigns",
    social: "Social Media",
    assets: "Assets",
    goals: "Goals & Performance",
    plan: "Quarterly Planner",
    review: "Review Meetings",
    kpi: "Weekly KPI",
};

export function Header({ user }: { user?: any }) {
    const pathname = usePathname();
    const pathSegments = pathname ? pathname.split('/').filter(Boolean) : [];
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { data: session, update } = useSession();
    const currentUser = user || session?.user;
    const userRole = currentUser?.role;
    const userPermissions = currentUser?.permissions as string[] | undefined;
    const router = useRouter();

    const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];

        const formData = new FormData();
        formData.append("file", file);

        try {
            const uploadRes = await uploadFile(formData);
            if (uploadRes.error || !uploadRes.url) {
                toast.error(uploadRes.error || "Upload failed");
                return;
            }

            const updateRes = await updateProfile({ image: uploadRes.url });
            if (updateRes.error) {
                toast.error(updateRes.error);
            } else {
                toast.success("Profile picture updated");
                await update({ image: uploadRes.url });
                router.refresh();
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    return (
        <header className="sticky top-0 z-40 mx-6 mt-3 mb-4 rounded-xl glass-2 border border-border/40 shadow-sm transition-all h-16 flex items-center justify-between px-6" >

            {/* Left: Breadcrumbs / Title */}
            <div className="flex items-center gap-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <button aria-label="Toggle Mobile Menu" suppressHydrationWarning className="md:hidden p-2 text-gray-500 hover:bg-white rounded-lg">
                            <Menu className="w-5 h-5" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72 p-0">
                        <div className="flex flex-col h-full bg-white dark:bg-black">
                            <div className="p-6 border-b border-border dark:border-white/10">
                                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                    Earthana <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">Mobile</span>
                                </h2>
                            </div>
                            <div className="flex-1 overflow-y-auto py-4">
                                <nav className="grid gap-1 px-2">
                                    {navItems.filter(item => {
                                        if (userRole === 'super-admin') return true;
                                        if (userPermissions?.includes('*')) return true;
                                        if (userPermissions?.includes(item.permission)) return true;
                                        return false;
                                    }).map((item, index) => {
                                        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                                        return (
                                            <Link
                                                key={index}
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-xl px-3 py-3 transition-all",
                                                    isActive
                                                        ? "bg-primary text-primary-foreground font-medium"
                                                        : "text-muted-foreground hover:bg-muted"
                                                )}
                                            >
                                                <item.icon className="h-5 w-5" />
                                                <span>{item.name}</span>
                                            </Link>
                                        )
                                    })}
                                </nav>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground overflow-hidden whitespace-nowrap">
                    {pathSegments.length === 0 && <span className="text-foreground font-bold tracking-tight text-gradient-primary">Dashboard</span>}
                    {pathSegments.map((segment, index) => {
                        const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
                        // Check if segment is a MongoDB ID (24 hex chars)
                        const isId = /^[0-9a-fA-F]{24}$/.test(segment);
                        const name = isId
                            ? "Details"
                            : (breadcrumbNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1));

                        const isLast = index === pathSegments.length - 1;

                        return (
                            <div key={href} className="flex items-center gap-2">
                                {index > 0 && <span className="text-muted-foreground/30">/</span>}
                                {isLast ? (
                                    <span className="text-foreground font-bold tracking-tight px-2 py-0.5 rounded-md bg-white/50">{name}</span>
                                ) : (
                                    <Link href={href} className="hover:text-primary transition-colors hidden sm:block">
                                        {name}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div >

            {/* Right: Actions */}
            < div className="flex items-center gap-3" >
                <div className="relative hidden md:block group">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="search"
                        aria-label="Universal Search"
                        placeholder="Search... (Ctrl+K)"
                        readOnly
                        onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                        className="h-10 w-64 rounded-xl border-none bg-secondary/10 px-10 py-2 text-sm text-foreground shadow-inner transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:w-80 outline-none placeholder:text-muted-foreground/70 cursor-pointer"
                    />
                </div>

                <button aria-label="Notifications" className="relative rounded-xl p-2.5 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>

                <ModeToggle />

                <div className="h-8 w-[1px] bg-white mx-1"></div>

                <div
                    className="relative"
                    onMouseLeave={() => setIsProfileOpen(false)}
                >
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        aria-label="User Profile"
                        onMouseEnter={() => setIsProfileOpen(true)}
                        className="flex items-center gap-3 rounded-full hover:bg-secondary/10 p-1 pr-3 transition-colors relative z-50"
                    >
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-emerald-300 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-bold ring-2 ring-white overflow-hidden">
                            {currentUser?.image ? (
                                <img src={currentUser.image} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-5 w-5" />
                            )}
                        </div>
                        <div className="hidden md:flex flex-col items-start leading-tight">
                            <span className="text-sm font-bold text-foreground">{currentUser?.name || 'Guest User'}</span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase">{userRole || 'Visitor'}</span>
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div
                            className="absolute right-0 top-full pt-2 w-56 z-50 animate-in fade-in slide-in-from-top-2"
                            onMouseEnter={() => setIsProfileOpen(true)}
                        >
                            <div className="bg-popover rounded-xl shadow-xl border border-border overflow-hidden p-1">
                                <div className="px-3 py-2 border-b border-border/50 dark:border-white/10 mb-1">
                                    <p className="text-sm font-bold text-foreground">{user?.name || 'Guest'}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user?.email || 'No email'}</p>
                                </div>

                                <label className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-primary/5 rounded-lg cursor-pointer transition-colors">
                                    <input type="file" className="hidden" accept="image/*" onChange={handleProfileImageUpload} />
                                    <User className="w-4 h-4" />
                                    Upload Photo
                                </label>

                                <Link href="/change-password" className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-primary/5 rounded-lg transition-colors w-full">
                                    <KeyRound className="w-4 h-4" />
                                    Change Password
                                </Link>

                                <div className="h-[1px] bg-border my-1"></div>

                                <Link href="/api/auth/signout" className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors w-full">
                                    Logout
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div >
        </header >
    )
}

