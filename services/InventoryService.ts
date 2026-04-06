import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import { sanitizeObject } from '@/lib/sanitize';

export interface ProductData {
    name: string;
    sku: string;
    category: string;
    quantity?: number;
    minLevel?: number;
    price?: number;
    description?: string;
}

export class InventoryService {
    /**
     * Create a new product
     */
    async createProduct(data: ProductData) {
        await connectToDatabase();
        const sanitized = sanitizeObject(data);

        const product = await Product.create(sanitized);
        return JSON.parse(JSON.stringify(product));
    }

    /**
     * Get all products with filtering
     */
    async getProducts(filters: any = {}) {
        await connectToDatabase();
        const query: any = { status: 'Active' };

        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { sku: { $regex: filters.search, $options: 'i' } }
            ];
        }
        if (filters.category && filters.category !== 'All Categories') {
            query.category = filters.category;
        }

        const products = await Product.find(query).sort({ updatedAt: -1 }).lean();
        return JSON.parse(JSON.stringify(products)).map((p: any) => ({
            id: p._id.toString(),
            name: p.name,
            sku: p.sku,
            category: p.category,
            stock: p.quantity,
            unit: "Units", // Default for now
            price: `₹${p.price?.toLocaleString() || 0}`,
            status: p.quantity === 0 ? 'Out of Stock' : p.quantity <= (p.minLevel || 5) ? 'Low Stock' : 'In Stock'
        }));
    }

    /**
     * Get inventory stats and low stock items
     */
    async getInventoryDashboardData() {
        await connectToDatabase();

        const [totalProducts, lowStockItems, totalValueAgg, outOfStock, lowStockCount, distribution] = await Promise.all([
            Product.countDocuments({ status: 'Active' }),
            Product.find({
                status: 'Active',
                $expr: { $lte: ["$quantity", "$minLevel"] }
            }).limit(10).lean(),
            Product.aggregate([
                { $match: { status: 'Active' } },
                { $group: { _id: null, total: { $sum: { $multiply: ["$quantity", "$price"] } } } }
            ]),
            Product.countDocuments({ status: 'Active', quantity: 0 }),
            Product.countDocuments({ status: 'Active', $expr: { $lte: ["$quantity", "$minLevel"] } }),
            Product.aggregate([
                { $match: { status: 'Active' } },
                { $group: { _id: "$category", count: { $sum: 1 } } }
            ])
        ]);

        return {
            stats: {
                totalProducts,
                lowStockCount,
                outOfStock,
                totalValue: totalValueAgg[0]?.total || 0
            },
            lowStockItems: JSON.parse(JSON.stringify(lowStockItems)).map((p: any) => ({
                id: p._id.toString(),
                name: p.name,
                sku: p.sku,
                current: p.quantity,
                min: p.minLevel,
                category: p.category
            })),
            distribution
        };
    }
}

export const inventoryService = new InventoryService();
