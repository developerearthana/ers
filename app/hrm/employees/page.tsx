"use client";

import { useState } from 'react';
import { Plus, Search, Filter, Mail, Phone, MoreHorizontal, User } from 'lucide-react';
import { PageWrapper, CardWrapper } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Employee {
    id: number;
    name: string;
    role: string;
    dept: string;
    subsidiary?: string;
    email: string;
    phone: string;
    status: string;
    gradient: string;
}

const gradients = [
    "from-blue-400 to-indigo-500",
    "from-emerald-400 to-teal-500",
    "from-orange-400 to-red-500",
    "from-purple-400 to-fuchsia-500",
    "from-cyan-400 to-sky-500",
];

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([
        { id: 1, name: "Rahul Sharma", role: "Sales Manager", dept: "Sales", email: "rahul@earthana.com", phone: "+91 98765 43210", status: "Active", gradient: gradients[0] },
        { id: 2, name: "Priya Singh", role: "Frontend Developer", dept: "IT", email: "priya@earthana.com", phone: "+91 99887 76655", status: "Active", gradient: gradients[1] },
        { id: 3, name: "Amit Verma", role: "Inventory Specialist", dept: "Operations", email: "amit@earthana.com", phone: "+91 91234 56789", status: "On Leave", gradient: gradients[2] },
        { id: 4, name: "Sneha Patel", role: "HR Executive", dept: "HR", email: "sneha@earthana.com", phone: "+91 98989 89898", status: "Active", gradient: gradients[3] },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [newEmployee, setNewEmployee] = useState({ name: '', role: 'Sales Manager', dept: 'Sales', subsidiary: 'Headquarters', email: '', phone: '' });

    const handleAddEmployee = () => {
        if (newEmployee.name && newEmployee.email) {
            setEmployees([...employees, {
                id: employees.length + 1,
                name: newEmployee.name,
                role: newEmployee.role,
                dept: newEmployee.dept,
                subsidiary: newEmployee.subsidiary,
                email: newEmployee.email,
                phone: newEmployee.phone,
                status: "Active",
                gradient: gradients[employees.length % gradients.length]
            }]);
            setShowModal(false);
            setNewEmployee({ name: '', role: 'Sales Manager', dept: 'Sales', subsidiary: 'Headquarters', email: '', phone: '' });
        }
    };

    return (
        <PageWrapper className="space-y-6 max-w-7xl mx-auto p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Employees</h1>
                    <p className="text-muted-foreground mt-1">Manage your team and organizational structure.</p>
                </div>
                <Button onClick={() => setShowModal(true)} className="shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Employee
                </Button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between border border-border shadow-sm bg-card">
                <div className="relative flex-1 w-full md:max-w-md group">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        aria-label="Search employees"
                        type="text"
                        placeholder="Search employees..."
                        className="pl-10 pr-4 py-2 w-full border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background focus:bg-card transition-all text-sm text-foreground"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" size="sm" className="gap-2 bg-card hover:bg-muted text-foreground border-border">
                        <Filter className="w-4 h-4" /> Filter
                    </Button>
                    <select aria-label="Department Filter" className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground focus:outline-none bg-card hover:bg-muted cursor-pointer">
                        <option>All Depts</option>
                        <option>Sales</option>
                        <option>IT</option>
                        <option>HR</option>
                        <option>Operations</option>
                    </select>
                </div>
            </div>

            {/* Employee List */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {employees.map((emp, idx) => (
                    <CardWrapper key={emp.id} delay={idx * 0.05} className="glass-card p-6 rounded-2xl border border-border hover:border-primary/20 hover:shadow-xl transition-all group relative bg-card">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex flex-col items-center text-center mb-6 relative">
                            <div className={cn("w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-lg bg-gradient-to-br", emp.gradient)}>
                                {emp.name.charAt(0)}
                            </div>
                            <h3 className="font-bold text-foreground text-lg">{emp.name}</h3>
                            <p className="text-sm font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-md mt-1">{emp.role}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{emp.dept}</p>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-border">
                            <div className="flex items-center gap-3 text-sm text-foreground group-hover:text-primary transition-colors">
                                <div className="p-1.5 bg-muted rounded-full text-muted-foreground">
                                    <Mail className="w-3.5 h-3.5" />
                                </div>
                                <span className="truncate flex-1 text-left">{emp.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-foreground group-hover:text-primary transition-colors">
                                <div className="p-1.5 bg-muted rounded-full text-muted-foreground">
                                    <Phone className="w-3.5 h-3.5" />
                                </div>
                                <span className="flex-1 text-left">{emp.phone}</span>
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-border flex justify-between items-center">
                            <span className={cn(
                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                            )}>
                                {emp.status}
                            </span>
                            <Button variant="link" className="text-xs h-auto p-0 text-muted-foreground hover:text-primary">
                                View Profile
                            </Button>
                        </div>
                    </CardWrapper>
                ))}
            </div>

            {/* Add Employee Modal */}
            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
                        >
                            <div className="glass-card bg-card rounded-2xl p-6 shadow-2xl border border-border">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-foreground">Add New Employee</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>✕</Button>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="empName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Full Name</label>
                                        <input
                                            id="empName"
                                            type="text"
                                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all bg-background text-foreground"
                                            value={newEmployee.name}
                                            onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                            placeholder="e.g. John Doe"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label htmlFor="empRole" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</label>
                                            <select
                                                id="empRole"
                                                className="w-full px-3 py-2 border rounded-lg bg-background outline-none text-sm focus:ring-2 focus:ring-primary/20"
                                                value={newEmployee.role}
                                                onChange={e => setNewEmployee({ ...newEmployee, role: e.target.value })}
                                            >
                                                <option>Sales Manager</option>
                                                <option>Frontend Developer</option>
                                                <option>Inventory Specialist</option>
                                                <option>HR Executive</option>
                                                <option>Operations Manager</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label htmlFor="empDept" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</label>
                                            <select
                                                id="empDept"
                                                className="w-full px-3 py-2 border rounded-lg bg-background outline-none text-sm focus:ring-2 focus:ring-primary/20"
                                                value={newEmployee.dept}
                                                onChange={e => setNewEmployee({ ...newEmployee, dept: e.target.value })}
                                            >
                                                <option>Sales</option>
                                                <option>IT</option>
                                                <option>Operations</option>
                                                <option>HR</option>
                                                <option>Finance</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="empEmail" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                                        <input
                                            id="empEmail"
                                            type="email"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                                            value={newEmployee.email}
                                            onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
                                            placeholder="email@company.com"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="empPhone" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
                                        <input
                                            id="empPhone"
                                            type="text"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                                            value={newEmployee.phone}
                                            onChange={e => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                                            placeholder="+91..."
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                                        <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                                        <Button onClick={handleAddEmployee} className="bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/20">
                                            Add Employee
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </PageWrapper>
    );
}
