import connectToDatabase from '@/lib/db';
import Campaign from '@/models/Campaign';
import { sanitizeObject } from '@/lib/sanitize';

export class MarketingService {
    async getCampaigns() {
        await connectToDatabase();
        const campaigns = await Campaign.find({}).sort({ startDate: -1 });
        return JSON.parse(JSON.stringify(campaigns)).map((c: any) => ({
            id: c._id.toString(),
            name: c.name,
            type: c.type,
            status: c.status,
            budget: `₹${c.budget.toLocaleString('en-IN')}`,
            spent: `₹${c.spent.toLocaleString('en-IN')}`,
            roi: `${c.metrics?.roi || 0}%`,
            clicks: c.metrics?.clicks ? (c.metrics.clicks > 1000 ? `${(c.metrics.clicks / 1000).toFixed(1)}k` : c.metrics.clicks) : '-'
        }));
    }

    async createCampaign(data: any) {
        await connectToDatabase();
        const sanitized = sanitizeObject(data);
        const campaign = await Campaign.create(sanitized);
        return JSON.parse(JSON.stringify(campaign));
    }
}

export const marketingService = new MarketingService();
