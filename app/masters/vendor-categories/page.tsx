"use client";

import { useState } from 'react';
import { Plus, Trash2, ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';

export default function VendorCategoriesMaster() {
    const [categories, setCategories] = useState([
        { id: 1, name: "Material Supplier", description: "Suppliers of raw materials and goods" },
        { id: 2, name: "Service Provider", description: "Companies providing intangible services" },
        { id: 3, name: "Contractor", description: "External individual or company for specific tasks" },
        { id: 4, name: "Consultant", description: "Advisory services" },
    ]);

    const [newCategory, setNewCategory] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        setCategories([...categories, {
            id: Date.now(),
            name: newCategory,
            description: newDesc
        }]);
        setNewCategory("");
        setNewDesc("");
        setShowAddForm(false);
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this category?")) {
            setCategories(categories.filter(c => c.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/masters" className="p-2 hover:bg-white rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vendor Categories</h1>
                    <p className="text-gray-500">Manage categories for vendor classification.</p>
                </div>
            </div>

            <div className="glass-card rounded-xl overflow-hidden p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-semibold text-lg text-gray-800">All Categories</h2>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Category
                    </button>
                </div>

                {showAddForm && (
                    <div className="mb-8 bg-background border border-gray-100 p-4 rounded-lg animate-in fade-in slide-in-from-top-2">
                        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Category Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                    placeholder="e.g., Logistics Partner"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 w-full">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Description (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                    placeholder="Short description"
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-background"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/80"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-background border-b border-gray-100 text-gray-500">
                            <tr>
                                <th className="px-6 py-3 font-medium">Category Name</th>
                                <th className="px-6 py-3 font-medium">Description</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {categories.map((cat) => (
                                <tr key={cat.id} className="group hover:bg-background/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                                        {cat.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{cat.description || '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                                            title="Delete Category"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
