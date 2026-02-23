"use client";

import { Plus, Search, Filter, Edit2, Trash2, Package, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getProducts, createProduct } from '@/app/actions/inventory';
import { toast } from 'sonner';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All Categories');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadProducts();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search, categoryFilter]);

    const loadProducts = async () => {
        try {
            const res = await getProducts({ search, category: categoryFilter });
            if (res.success && res.data) {
                setProducts(res.data);
            }
        } catch (error) {
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const [showNewProductModal, setShowNewProductModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', sku: '', category: 'Furniture', quantity: 0, minLevel: 5, price: 0 });
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateProduct = async () => {
        if (!newProduct.name || !newProduct.sku) {
            toast.error("Name and SKU are required");
            return;
        }

        setIsCreating(true);
        try {
            const result = await createProduct(newProduct);
            if (result.success) {
                toast.success("Product created successfully");
                setShowNewProductModal(false);
                loadProducts();
                setNewProduct({ name: '', sku: '', category: 'Furniture', quantity: 0, minLevel: 5, price: 0 });
            } else {
                toast.error(result.error || "Failed to create product");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsCreating(false);
        }
    };

    if (loading && products.length === 0) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <PageWrapper className="space-y-6 max-w-[1920px] mx-auto p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Products</h1>
                    <p className="text-muted-foreground mt-1">Manage your product catalog and specs.</p>
                </div>
                <Button onClick={() => setShowNewProductModal(true)} className="shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                </Button>
            </div>

            {/* New Product Modal */}
            {showNewProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-gray-900">Add New Product</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter product name"
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                                <input
                                    type="text"
                                    placeholder="Unique SKU"
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={newProduct.sku}
                                    onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    aria-label="Product Category"
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                                    value={newProduct.category}
                                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                >
                                    <option value="Furniture">Furniture</option>
                                    <option value="Construction">Construction</option>
                                    <option value="Electronics">Electronics</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                <input
                                    type="number"
                                    aria-label="Product Quantity"
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={newProduct.quantity}
                                    onChange={e => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Level</label>
                                <input
                                    type="number"
                                    aria-label="Minimum Stock Level"
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={newProduct.minLevel}
                                    onChange={e => setNewProduct({ ...newProduct, minLevel: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                <input
                                    type="number"
                                    aria-label="Product Price"
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={newProduct.price}
                                    onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2 gap-2">
                            <Button variant="ghost" onClick={() => setShowNewProductModal(false)}>Cancel</Button>
                            <Button onClick={handleCreateProduct} disabled={isCreating}>
                                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Product"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters & Controls */}
            <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between border border-white/40 shadow-sm">
                <div className="relative flex-1 w-full md:max-w-md group">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search products by name or SKU..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white/50 focus:bg-white transition-all text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="gap-2 text-gray-600">
                        <Filter className="w-4 h-4" />
                        Filter
                    </Button>
                    <select
                        aria-label="Category Filter"
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 focus:outline-none bg-white cursor-pointer hover:bg-background"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option>All Categories</option>
                        <option>Furniture</option>
                        <option>Construction</option>
                        <option>Electronics</option>
                    </select>
                </div>
            </div>

            {/* Product Table */}
            <div className="glass-card rounded-xl overflow-hidden border border-white/40 shadow-xl bg-white/40 backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                <th className="px-6 py-4">Product Info</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4 text-right">Stock</th>
                                <th className="px-6 py-4 text-right">Price</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                        No products found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence mode='popLayout'>
                                    {products.map((product, index) => (
                                        <motion.tr
                                            key={product.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2, delay: index * 0.05 }}
                                            className="hover:bg-white/60 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center text-gray-400 shadow-sm border border-gray-200">
                                                        <Package className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                                                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className={cn("font-semibold", product.stock <= 5 ? 'text-red-600' : 'text-gray-900')}>
                                                        {product.stock}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{product.unit}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                {product.price}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
                                                    product.status === 'In Stock' ? 'bg-white text-green-700 border-border' :
                                                        product.status === 'Low Stock' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                            'bg-red-50 text-red-700 border-red-100'
                                                )}>
                                                    {product.status === 'Low Stock' && <AlertCircle className="w-3 h-3" />}
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-white">
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageWrapper>
    );
}
