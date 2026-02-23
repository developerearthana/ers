import connectToDatabase from '@/lib/db';
import Asset from '@/models/Asset';
import AssetAssignment from '@/models/AssetAssignment';
import mongoose from 'mongoose';
import { sanitizeObject } from '@/lib/sanitize';

export class AssetService {
    async getAssets(filters: any = {}) {
        await connectToDatabase();
        const query: any = {};
        if (filters.category && filters.category !== 'All') query.category = filters.category;
        if (filters.status && filters.status !== 'All') query.status = filters.status;
        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { serialNo: { $regex: filters.search, $options: 'i' } }
            ];
        }

        const assets = await Asset.find(query)
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        return JSON.parse(JSON.stringify(assets)).map((a: any) => ({
            ...a,
            id: a._id.toString(),
            value: a.purchasePrice ? `₹${a.purchasePrice.toLocaleString('en-IN')}` : '₹0',
            purchaseDate: new Date(a.purchaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        }));
    }

    async getAssetStats() {
        await connectToDatabase();
        const [totalAssets, assignedAssets, underMaintenance, totalValue] = await Promise.all([
            Asset.countDocuments(),
            Asset.countDocuments({ status: 'Assigned' }),
            Asset.countDocuments({ status: 'Maintenance' }),
            Asset.aggregate([{ $group: { _id: null, total: { $sum: '$purchasePrice' } } }])
        ]);

        return {
            total: totalAssets,
            assigned: assignedAssets,
            maintenance: underMaintenance,
            value: totalValue[0]?.total || 0
        };
    }

    async createAsset(data: any) {
        await connectToDatabase();
        const sanitized = sanitizeObject(data);
        const asset = await Asset.create(sanitized);
        return JSON.parse(JSON.stringify(asset));
    }

    async assignAsset(assetId: string, userId: string, assignedBy: string, notes?: string) {
        await connectToDatabase();
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const asset = await Asset.findByIdAndUpdate(
                assetId,
                {
                    status: 'Assigned',
                    assignedTo: userId,
                    assignedDate: new Date()
                },
                { session, new: true }
            );

            if (!asset) throw new Error("Asset not found");

            await AssetAssignment.create([{
                assetId,
                assignedTo: userId,
                assignedBy,
                assignedDate: new Date(),
                notes
            }], { session });

            await session.commitTransaction();
            return JSON.parse(JSON.stringify(asset));
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async returnAsset(assetId: string, assignedBy: string, condition: string, notes?: string) {
        await connectToDatabase();
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const asset = await Asset.findById(assetId);
            if (!asset) throw new Error("Asset not found");

            // Only verify assignment if strict, but let's be flexible for manual overrides
            const userId = asset.assignedTo;

            if (userId) {
                await AssetAssignment.findOneAndUpdate(
                    { assetId, assignedTo: userId, returnDate: { $exists: false } },
                    {
                        returnDate: new Date(),
                        conditionOnReturn: condition,
                        notes: notes ? notes : undefined
                    },
                    { session, sort: { assignedDate: -1 } }
                );
            }

            const updatedAsset = await Asset.findByIdAndUpdate(
                assetId,
                {
                    status: 'Available',
                    $unset: { assignedTo: 1, assignedDate: 1 }
                },
                { session, new: true }
            );

            await session.commitTransaction();
            return JSON.parse(JSON.stringify(updatedAsset));
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}

export const assetService = new AssetService();
