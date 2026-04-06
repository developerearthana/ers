import connectToDatabase from '@/lib/db';
import Lead from '@/models/Lead';
import Deal from '@/models/Deal';
import Order from '@/models/Order';
import Invoice from '@/models/Invoice';
import { sanitizeObject } from '@/lib/sanitize';

export class SalesService {
    /**
     * Get Sales Dashboard Stats
     */
    async getDashboardStats() {
        await connectToDatabase();

        const [revenueAgg, pipelineResult, newLeadsCount, recentDeals, funnelAgg, leadsCount] = await Promise.all([
            // 1. Total Revenue (Closed Won deals)
            Deal.aggregate([
                { $match: { stage: 'Closed Won' } },
                { $group: { _id: null, total: { $sum: "$value" } } }
            ]),
            // 2. Active Deals count + pipeline value in one pass
            Deal.aggregate([
                { $match: { stage: { $nin: ['Closed Won', 'Closed Lost'] } } },
                { $group: { _id: null, count: { $sum: 1 }, total: { $sum: "$value" } } }
            ]),
            // 3. New Leads
            Lead.countDocuments({ status: 'New' }),
            // 4. Recent Deals
            Deal.find({}).sort({ updatedAt: -1 }).limit(5).lean(),
            // 5. Funnel Data
            Deal.aggregate([{ $group: { _id: "$stage", count: { $sum: 1 } } }]),
            // 6. Total Leads
            Lead.countDocuments({})
        ]);

        const activeDealsCount = pipelineResult[0]?.count || 0;
        const pipelineValue = pipelineResult[0]?.total || 0;

        return {
            revenue: revenueAgg[0]?.total || 0,
            activeDeals: activeDealsCount,
            pipelineValue: pipelineValue,
            newLeads: newLeadsCount,
            recentDeals: JSON.parse(JSON.stringify(recentDeals)).map((d: any) => ({
                id: d._id.toString(),
                client: d.client,
                value: d.value,
                stage: d.stage,
                date: new Date(d.updatedAt).toLocaleDateString()
            })),
            funnel: {
                leads: leadsCount,
                stages: funnelAgg
            }
        };
    }

    /**
     * Get All Leads
     */
    async getLeads() {
        await connectToDatabase();
        const leads = await Lead.find({}).sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(leads));
    }

    /**
     * Get All Deals
     */
    async getDeals() {
        await connectToDatabase();
        const deals = await Deal.find({}).sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(deals));
    }

    /**
     * Get All Orders
     */
    async getOrders() {
        await connectToDatabase();
        const orders = await Order.find({}).sort({ date: -1 }).lean();
        return JSON.parse(JSON.stringify(orders));
    }

    /**
     * Get All Invoices
     */
    async getInvoices() {
        await connectToDatabase();
        const invoices = await Invoice.find({}).sort({ issueDate: -1 }).lean();
        return JSON.parse(JSON.stringify(invoices));
    }

    /**
     * Create New Lead
     */
    async createLead(data: any) {
        await connectToDatabase();
        const sanitized = sanitizeObject(data);
        const newLead = new Lead(sanitized);
        await newLead.save();

        // Revalidate Leads Page
        try {
            const { revalidatePath } = await import('next/cache');
            revalidatePath('/sales/leads');
            revalidatePath('/sales');
        } catch (e) {
            console.error("Failed to revalidate path", e);
        }

        return JSON.parse(JSON.stringify(newLead));
    }

    /**
     * Create New Order
     */
    async createOrder(data: any) {
        await connectToDatabase();
        const sanitized = sanitizeObject(data);
        // Auto-generate Order ID if not provided
        if (!sanitized.orderId) {
            const count = await Order.countDocuments();
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            sanitized.orderId = `ORD-${dateStr}-${String(count + 1).padStart(3, '0')}`;
        }
        const newOrder = new Order(sanitized);
        await newOrder.save();
        return JSON.parse(JSON.stringify(newOrder));
    }

    /**
     * Create New Invoice
     */
    async createInvoice(data: any) {
        await connectToDatabase();
        const sanitized = sanitizeObject(data);
        // Auto-generate Invoice ID if not provided
        if (!sanitized.invoiceId) {
            const count = await Invoice.countDocuments();
            const year = new Date().getFullYear();
            sanitized.invoiceId = `INV-${year}-${String(count + 1).padStart(4, '0')}`;
        }
        const newInvoice = new Invoice(sanitized);
        await newInvoice.save();
        return JSON.parse(JSON.stringify(newInvoice));
    }

    /**
     * Add Follow-up Remark to Lead
     */
    async addFollowUp(leadId: string, status: string, remark: string) {
        await connectToDatabase();
        const lead = await Lead.findById(leadId);
        if (!lead) throw new Error("Lead not found");

        lead.status = status;
        lead.remarks.push({
            status,
            note: remark,
            date: new Date()
        });

        await lead.save();
        return JSON.parse(JSON.stringify(lead));
    }
}

export const salesService = new SalesService();
