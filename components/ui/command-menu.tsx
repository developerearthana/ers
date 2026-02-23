"use client";

import * as React from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    User,
    LayoutDashboard,
    Search,
    PlusCircle,
    FileText,
    Users,
    Briefcase,
    Package,
    CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CommandMenu() {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);

    // Toggle with Cmd+K or Ctrl+K
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
            if (e.key === "Escape") {
                setOpen(false);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    // Premium Styling Classes
    const itemClass = "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-3 text-sm outline-none aria-selected:bg-primary/10 aria-selected:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-gray-600 transition-all duration-200 group";
    const iconClass = "mr-3 h-5 w-5 text-gray-400 group-aria-selected:text-primary transition-colors";
    const headingClass = "px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 mt-2";

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                    />

                    {/* Command Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/40 bg-white/80 dark:bg-black/80 shadow-2xl backdrop-blur-xl ring-1 ring-black/5"
                    >
                        <Command
                            loop
                            label="Global Command Menu"
                            className="bg-transparent"
                        >
                            <div className="flex items-center border-b px-4" cmdk-input-wrapper="">
                                <Search className="mr-2 h-5 w-5 shrink-0 opacity-50" />
                                <Command.Input
                                    placeholder="Type a command or search..."
                                    className="flex h-14 w-full rounded-md bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 font-medium"
                                />
                                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-white/50 px-2 py-1 rounded border border-gray-200">
                                    <span className="text-xs">ESC</span>
                                </div>
                            </div>

                            <Command.List className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-2 scrollbar-hide">
                                <Command.Empty className="py-10 text-center text-sm text-muted-foreground">
                                    No results found.
                                </Command.Empty>

                                <Command.Group heading="Quick Actions" className={headingClass}>
                                    <Command.Item onSelect={() => runCommand(() => router.push('/accounts/petty-cash/new'))} className={itemClass}>
                                        <PlusCircle className={iconClass} />
                                        <span>New Transaction</span>
                                        <span className="ml-auto text-xs text-muted-foreground opacity-0 group-aria-selected:opacity-100 transition-opacity">Accounts</span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => router.push('/sales/leads'))} className={itemClass}>
                                        <User className={iconClass} />
                                        <span>Add New Lead</span>
                                        <span className="ml-auto text-xs text-muted-foreground opacity-0 group-aria-selected:opacity-100 transition-opacity">CRM</span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => router.push('/activity/todo'))} className={itemClass}>
                                        <FileText className={iconClass} />
                                        <span>Create Task</span>
                                        <span className="ml-auto text-xs text-muted-foreground opacity-0 group-aria-selected:opacity-100 transition-opacity">Activity</span>
                                    </Command.Item>
                                </Command.Group>

                                <Command.Separator className="my-2 h-px bg-white/50" />

                                <Command.Group heading="Navigation" className={headingClass}>
                                    <Command.Item onSelect={() => runCommand(() => router.push('/dashboard'))} className={itemClass}>
                                        <LayoutDashboard className={iconClass} />
                                        <span>Dashboard</span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => router.push('/accounts/petty-cash'))} className={itemClass}>
                                        <Calculator className={iconClass} />
                                        <span>Accounts Dashboard</span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => router.push('/accounts/receipts'))} className={itemClass}>
                                        <FileText className={iconClass} />
                                        <span>Scan Receipts</span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => router.push('/accounts/verify'))} className={itemClass}>
                                        <CheckCircle className={iconClass} />
                                        <span>Verify Expenses</span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => router.push('/sales/pipeline'))} className={itemClass}>
                                        <CreditCard className={iconClass} />
                                        <span>Sales Pipeline</span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => router.push('/activity/calendar'))} className={itemClass}>
                                        <Calendar className={iconClass} />
                                        <span>Calendar</span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => router.push('/hrm/employees'))} className={itemClass}>
                                        <Users className={iconClass} />
                                        <span>Employees</span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => router.push('/hrm/leave'))} className={itemClass}>
                                        <Calendar className={iconClass} />
                                        <span>Leave Management</span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => router.push('/hrm/payroll'))} className={itemClass}>
                                        <Calculator className={iconClass} />
                                        <span>Payroll & Slips</span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => router.push('/hrm/documents'))} className={itemClass}>
                                        <FileText className={iconClass} />
                                        <span>My Documents</span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => router.push('/inventory'))} className={itemClass}>
                                        <Package className={iconClass} />
                                        <span>Inventory</span>
                                    </Command.Item>
                                </Command.Group>

                                <Command.Separator className="my-2 h-px bg-border" />

                                <Command.Group heading="Settings" className={headingClass}>
                                    <Command.Item onSelect={() => runCommand(() => router.push('/settings'))} className={itemClass}>
                                        <Settings className={iconClass} />
                                        <span>Settings</span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => router.push('/profile'))} className={itemClass}>
                                        <User className={iconClass} />
                                        <span>Profile</span>
                                    </Command.Item>
                                </Command.Group>
                            </Command.List>

                            <div className="border-t px-4 py-2 text-xs text-muted-foreground flex justify-between bg-background/50">
                                <span>Press ↵ to select</span>
                                <span>Earthana OS v1.0</span>
                            </div>
                        </Command>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

