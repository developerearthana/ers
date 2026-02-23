import PurchaseOrder, { IPurchaseOrder } from '@/models/PurchaseOrder';
import Contact from '@/models/Contact';
import connectToDatabase from '@/lib/db';
import { sanitizeObject } from '@/lib/sanitize';
import mongoose from 'mongoose';

export class PurchaseService {
    static async getDashboardStats() {
        await connectToDatabase();

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [
            openOrdersCount,
            pendingGrnCount,
            overdueCount,
            monthlySpend
        ] = await Promise.all([
            PurchaseOrder.countDocuments({ status: { $in: ['Sent', 'Partially Received'] } }),
            PurchaseOrder.countDocuments({ status: { $in: ['Sent', 'Partially Received'] } }), // Simplified: assuming sent = pending GRN
            PurchaseOrder.countDocuments({ status: { $in: ['Sent', 'Partially Received'] }, deliveryDate: { $lt: now } }),
            PurchaseOrder.aggregate([
                { $match: { date: { $gte: startOfMonth } } },
                { $group: { _id: null, total: { $sum: "$totalValue" } } }
            ])
        ]);

        return {
            openOrders: openOrdersCount,
            pendingGrn: pendingGrnCount,
            overdue: overdueCount,
            monthlySpend: monthlySpend[0]?.total || 0
        };
    }

    static async getOrders(filters: any = {}) {
        await connectToDatabase();
        const query: any = {};

        if (filters.status && filters.status !== 'All') {
            query.status = filters.status;
        }
        if (filters.search) {
            query.$or = [
                { poNumber: { $regex: filters.search, $options: 'i' } },
                { vendor: { $regex: filters.search, $options: 'i' } }
            ];
        }

        const orders = await PurchaseOrder.find(query)
            .sort({ createdAt: -1 })
            .limit(50);

        return orders.map(order => sanitizeObject({
            ...order.toObject(),
            itemsCount: order.items?.length || 0
        }));
    }

    static async createOrder(data: Partial<IPurchaseOrder>) {
        await connectToDatabase();

        // Auto-generate PO Number if not provided
        if (!data.poNumber) {
            const count = await PurchaseOrder.countDocuments();
            const year = new Date().getFullYear();
            data.poNumber = `PO-${year}-${String(count + 1).padStart(3, '0')}`;
        }

        const order = await PurchaseOrder.create(data);
        return sanitizeObject(order.toObject());
    }

    static async updateOrder(id: string, data: Partial<IPurchaseOrder>) {
        await connectToDatabase();
        const order = await PurchaseOrder.findByIdAndUpdate(id, data, { new: true });
        if (!order) throw new Error("Order not found");
        return sanitizeObject(order.toObject());
    }

    static async getVendors() {
        await connectToDatabase();

        const vendors = await Contact.aggregate([
            { $match: { type: 'Vendor', status: 'Active' } },
            {
                $lookup: {
                    from: 'purchaseorders',
                    let: { vendorName: '$name' }, // Join by name as per current schema design
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$vendor', '$$vendorName'] },
                                        { $in: ['$status', ['Sent', 'Partially Received']] }
                                    ]
                                }
                            }
                        },
                        { $count: 'count' }
                    ],
                    as: 'openPOs'
                }
            },
            {
                $project: {
                    name: 1,
                    company: 1,
                    email: 1,
                    phone: 1,
                    address: 1,
                    category: 1,
                    openPOCount: { $ifNull: [{ $arrayElemAt: ['$openPOs.count', 0] }, 0] }
                }
            },
            { $sort: { name: 1 } }
        ]);

        return vendors.map(v => sanitizeObject(v));
    }

    static async getVendorStats(vendorName: string) {
        await connectToDatabase();
        // Simple mock stats for now based on POs
        const now = new Date();
        const [activeConf, pendingOrders, totalPendingValue] = await Promise.all([
            Promise.resolve(3), // Mock contract count
            PurchaseOrder.countDocuments({ vendor: vendorName, status: { $in: ['Sent', 'Partially Received'] } }),
            PurchaseOrder.aggregate([
                { $match: { vendor: vendorName, status: { $in: ['Sent', 'Partially Received'] } } },
                { $group: { _id: null, total: { $sum: "$totalValue" } } }
            ])
        ]);

        return {
            activeContracts: activeConf,
            pendingOrders: pendingOrders,
            pendingValue: totalPendingValue[0]?.total || 0,
            performance: 98 // Mock score
        };
    }
}
