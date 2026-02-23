import connectToDatabase from '@/lib/db';
import FiscalYear from '@/models/FiscalYear';
import PettyCashTransaction from '@/models/PettyCashTransaction';
import { logDataChange } from '@/lib/audit';
import mongoose from 'mongoose';

export interface FiscalYearData {
    name: string;
    startDate: Date;
    endDate: Date;
    isCurrent?: boolean;
}

export interface ClosingBalanceEntry {
    account: string;
    balance: number;
    type: 'debit' | 'credit';
}

/**
 * Service layer for Fiscal Year operations
 * Handles business logic and database transactions
 */
export class FiscalYearService {
    /**
     * Create a new fiscal year
     */
    async createFiscalYear(data: FiscalYearData, userId?: string): Promise<any> {
        await connectToDatabase();

        const newFY = await FiscalYear.create({
            ...data,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
        });

        if (userId) {
            await logDataChange('create', 'FiscalYear', newFY._id.toString(), userId, {
                name: data.name,
            });
        }

        return JSON.parse(JSON.stringify(newFY));
    }

    /**
     * Get all fiscal years
     */
    async getAllFiscalYears(): Promise<any[]> {
        await connectToDatabase();
        const years = await FiscalYear.find({}).sort({ startDate: -1 }).lean();
        return JSON.parse(JSON.stringify(years));
    }

    /**
     * Set a fiscal year as current
     */
    async setCurrentFiscalYear(id: string, userId?: string): Promise<void> {
        await connectToDatabase();

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Reset all to not current
            await FiscalYear.updateMany({}, { isCurrent: false }, { session });

            // Set selected to current
            await FiscalYear.findByIdAndUpdate(id, { isCurrent: true }, { session });

            await session.commitTransaction();

            if (userId) {
                await logDataChange('update', 'FiscalYear', id, userId, {
                    action: 'set_current',
                });
            }
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Calculate closing balances for a fiscal year
     */
    private async calculateClosingBalances(fiscalYearId: string): Promise<ClosingBalanceEntry[]> {
        await connectToDatabase();

        const fiscalYear = await FiscalYear.findById(fiscalYearId);
        if (!fiscalYear) {
            throw new Error('Fiscal year not found');
        }

        // Get all transactions within the fiscal year
        const transactions = await PettyCashTransaction.find({
            date: {
                $gte: fiscalYear.startDate,
                $lte: fiscalYear.endDate,
            },
            status: 'Approved',
        }).lean();

        // Calculate balances by location and payment mode
        const balances: Record<string, number> = {};

        for (const txn of transactions) {
            const key = `${txn.location}-${txn.paymentMode}`;

            if (!balances[key]) {
                balances[key] = 0;
            }

            if (txn.type === 'Income') {
                balances[key] += txn.amount;
            } else {
                balances[key] -= txn.amount;
            }
        }

        // Convert to closing balance entries
        return Object.entries(balances).map(([key, balance]) => ({
            account: key,
            balance: Math.abs(balance),
            type: balance >= 0 ? 'debit' : 'credit',
        }));
    }

    /**
     * Create opening balance entries for the next fiscal year
     */
    private async createOpeningBalances(
        nextFiscalYearId: string,
        closingBalances: ClosingBalanceEntry[]
    ): Promise<void> {
        await connectToDatabase();

        const nextFiscalYear = await FiscalYear.findById(nextFiscalYearId);
        if (!nextFiscalYear) {
            throw new Error('Next fiscal year not found');
        }

        // Create opening balance transactions
        const openingTransactions = closingBalances.map((balance) => {
            const [location, paymentMode] = balance.account.split('-');

            return {
                subsidiary: 'Opening Balance',
                location,
                type: balance.type === 'debit' ? 'Income' : 'Expense',
                party: 'Opening Balance',
                category: 'Opening Balance',
                reference: `OB-${nextFiscalYear.name}`,
                amount: balance.balance,
                remarks: `Opening balance from FY ${nextFiscalYear.name}`,
                paymentMode,
                status: 'Approved',
                date: nextFiscalYear.startDate,
            };
        });

        if (openingTransactions.length > 0) {
            await PettyCashTransaction.insertMany(openingTransactions);
        }
    }

    /**
     * Close a fiscal year
     * Calculates closing balances and creates opening balances for next FY
     */
    async closeFiscalYear(id: string, userId?: string): Promise<{ success: boolean; message: string }> {
        await connectToDatabase();

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const fiscalYear = await FiscalYear.findById(id).session(session);
            if (!fiscalYear) {
                throw new Error('Fiscal year not found');
            }

            if (fiscalYear.status === 'Closed') {
                throw new Error('Fiscal year is already closed');
            }

            // Find the next fiscal year
            const nextFiscalYear = await FiscalYear.findOne({
                startDate: { $gt: fiscalYear.endDate },
            })
                .sort({ startDate: 1 })
                .session(session);

            // Calculate closing balances
            const closingBalances = await this.calculateClosingBalances(id);

            // Update fiscal year status
            await FiscalYear.findByIdAndUpdate(
                id,
                { status: 'Closed' },
                { session }
            );

            // Create opening balances for next FY if it exists
            if (nextFiscalYear) {
                await this.createOpeningBalances(nextFiscalYear._id.toString(), closingBalances);
            }

            await session.commitTransaction();

            if (userId) {
                await logDataChange('update', 'FiscalYear', id, userId, {
                    action: 'close',
                    closingBalancesCount: closingBalances.length,
                });
            }

            return {
                success: true,
                message: `Fiscal year closed successfully. ${closingBalances.length} closing balances calculated${nextFiscalYear ? ' and carried forward to next FY' : ''
                    }.`,
            };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}

// Export singleton instance
export const fiscalYearService = new FiscalYearService();
