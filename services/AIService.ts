import connectToDatabase from '@/lib/db';
import Lead from '@/models/Lead';
import Deal from '@/models/Deal';

/**
 * AI Service for Sales Intelligence
 * Provides lead scoring, deal win probability, and smart recommendations
 */
export class AIService {
    /**
     * Calculate AI Score for a Lead (0-100)
     * Factors: Source quality, estimated value, follow-up engagement, recency
     */
    calculateLeadScore(lead: any): { score: number; breakdown: any; label: string } {
        let score = 0;
        const breakdown: any = {};

        // 1. Source Quality (0-25 points)
        const sourceScores: Record<string, number> = {
            'Referral': 25,
            'Website': 20,
            'LinkedIn': 18,
            'Contact Module': 15,
            'Cold Call': 10,
            'Trade Show': 15,
            'Unknown': 5
        };
        breakdown.source = sourceScores[lead.source] || 5;
        score += breakdown.source;

        // 2. Estimated Value (0-25 points)
        const value = lead.value || 0;
        if (value >= 1000000) breakdown.value = 25;
        else if (value >= 500000) breakdown.value = 20;
        else if (value >= 100000) breakdown.value = 15;
        else if (value >= 50000) breakdown.value = 10;
        else breakdown.value = 5;
        score += breakdown.value;

        // 3. Engagement / Follow-ups (0-25 points)
        const remarksCount = lead.remarks?.length || 0;
        if (remarksCount >= 5) breakdown.engagement = 25;
        else if (remarksCount >= 3) breakdown.engagement = 20;
        else if (remarksCount >= 1) breakdown.engagement = 10;
        else breakdown.engagement = 0;
        score += breakdown.engagement;

        // 4. Status Progression (0-15 points)
        const statusScores: Record<string, number> = {
            'New': 5,
            'Contacted': 10,
            'Qualified': 15,
            'Converted': 15,
            'Lost': 0
        };
        breakdown.status = statusScores[lead.status] || 5;
        score += breakdown.status;

        // 5. Recency Bonus (0-10 points)
        const daysSinceUpdate = Math.floor(
            (Date.now() - new Date(lead.updatedAt || lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceUpdate <= 3) breakdown.recency = 10;
        else if (daysSinceUpdate <= 7) breakdown.recency = 7;
        else if (daysSinceUpdate <= 14) breakdown.recency = 4;
        else breakdown.recency = 0;
        score += breakdown.recency;

        // Determine label
        let label = 'Cold';
        if (score >= 70) label = 'Hot';
        else if (score >= 45) label = 'Warm';

        return { score: Math.min(score, 100), breakdown, label };
    }

    /**
     * Predict Deal Win Probability (0-100%)
     * Factors: Stage, age, value, velocity
     */
    predictDealWin(deal: any): { probability: number; health: string; factors: string[] } {
        let probability = 50; // Base probability
        const factors: string[] = [];

        // Stage-based probability
        const stageProb: Record<string, number> = {
            'Qualified': 20,
            'Proposal': 40,
            'Negotiation': 60,
            'Closed Won': 100,
            'Closed Lost': 0
        };
        probability = stageProb[deal.stage] || 30;

        // Age factor (older deals lose probability)
        const dealAge = Math.floor(
            (Date.now() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (dealAge > 60) {
            probability -= 15;
            factors.push('Deal age > 60 days');
        } else if (dealAge > 30) {
            probability -= 8;
            factors.push('Deal age > 30 days');
        }

        // Value factor (high value deals slightly risky but rewarding)
        if (deal.value > 1000000) {
            factors.push('High-value deal (risky but rewarding)');
        }

        // Health determination
        let health = 'Healthy';
        if (probability < 30) health = 'At Risk';
        else if (probability < 50) health = 'Needs Attention';

        return {
            probability: Math.max(0, Math.min(100, probability)),
            health,
            factors
        };
    }

    /**
     * Suggest Next Best Action for a Lead/Deal
     */
    suggestNextAction(entity: any, type: 'lead' | 'deal'): { action: string; priority: string; icon: string } {
        if (type === 'lead') {
            const daysSinceUpdate = Math.floor(
                (Date.now() - new Date(entity.updatedAt || entity.createdAt).getTime()) / (1000 * 60 * 60 * 24)
            );

            if (entity.status === 'New') {
                return { action: 'Make first contact', priority: 'high', icon: 'phone' };
            }
            if (daysSinceUpdate > 7) {
                return { action: 'Follow up (silent for ' + daysSinceUpdate + ' days)', priority: 'high', icon: 'bell' };
            }
            if (entity.status === 'Contacted') {
                return { action: 'Schedule a demo', priority: 'medium', icon: 'calendar' };
            }
            if (entity.status === 'Qualified') {
                return { action: 'Send proposal', priority: 'high', icon: 'file' };
            }
            return { action: 'Continue nurturing', priority: 'low', icon: 'heart' };
        }

        // Deal actions
        if (entity.stage === 'Qualified') {
            return { action: 'Prepare proposal', priority: 'medium', icon: 'file' };
        }
        if (entity.stage === 'Proposal') {
            return { action: 'Schedule negotiation call', priority: 'high', icon: 'phone' };
        }
        if (entity.stage === 'Negotiation') {
            return { action: 'Close the deal', priority: 'high', icon: 'check' };
        }
        return { action: 'Review deal status', priority: 'low', icon: 'eye' };
    }

    /**
     * Get At-Risk Deals (stagnant or low probability)
     */
    async getAtRiskDeals(): Promise<any[]> {
        await connectToDatabase();

        const deals = await Deal.find({
            stage: { $nin: ['Closed Won', 'Closed Lost'] }
        }).sort({ updatedAt: 1 }).lean();

        const atRisk: any[] = [];
        const now = Date.now();

        for (const deal of deals) {
            const daysSinceUpdate = Math.floor(
                (now - new Date(deal.updatedAt || deal.createdAt).getTime()) / (1000 * 60 * 60 * 24)
            );

            const { probability, health } = this.predictDealWin(deal);

            if (daysSinceUpdate > 14 || probability < 40) {
                atRisk.push({
                    ...JSON.parse(JSON.stringify(deal)),
                    daysSinceUpdate,
                    probability,
                    health,
                    riskReason: daysSinceUpdate > 14 ? 'Stagnant' : 'Low probability'
                });
            }
        }

        return atRisk.slice(0, 10); // Top 10 at-risk
    }

    /**
     * Generate Revenue Forecast (Simple projection based on pipeline)
     */
    async generateForecast(): Promise<{ next30: number; next60: number; next90: number }> {
        await connectToDatabase();

        const deals = await Deal.find({
            stage: { $nin: ['Closed Won', 'Closed Lost'] }
        }).lean();

        let next30 = 0, next60 = 0, next90 = 0;

        for (const deal of deals) {
            const { probability } = this.predictDealWin(deal);
            const expectedValue = (deal.value || 0) * (probability / 100);

            // Distribute based on stage velocity
            if (deal.stage === 'Negotiation') {
                next30 += expectedValue;
            } else if (deal.stage === 'Proposal') {
                next60 += expectedValue;
            } else {
                next90 += expectedValue;
            }
        }

        return { next30, next60, next90 };
    }

    /**
     * Enrich leads with AI scores
     */
    async getLeadsWithScores(): Promise<any[]> {
        await connectToDatabase();
        const leads = await Lead.find({}).sort({ createdAt: -1 }).lean();

        return leads.map(lead => {
            const aiData = this.calculateLeadScore(lead);
            const suggestion = this.suggestNextAction(lead, 'lead');
            return {
                ...JSON.parse(JSON.stringify(lead)),
                aiScore: aiData.score,
                aiScoreLabel: aiData.label,
                aiScoreBreakdown: aiData.breakdown,
                suggestedAction: suggestion
            };
        });
    }

    /**
     * Generate AI Content (Stub for build compatibility)
     */
    async generateContent(userId: string, type: string, data: any): Promise<string> {
        console.log(`Generating AI content for ${userId}: ${type}`);
        return `Sample AI generated content for ${type}`;
    }

    /**
     * Get AI Generation History (Stub for build compatibility)
     */
    async getHistory(userId: string): Promise<any[]> {
        console.log(`Fetching AI history for ${userId}`);
        return [];
    }
}

export const aiService = new AIService();
