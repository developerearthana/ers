import { FiscalYearService, FiscalYearData, ClosingBalanceEntry } from '@/services/FiscalYearService';
import FiscalYear from '@/models/FiscalYear';
import PettyCashTransaction from '@/models/PettyCashTransaction';
import connectToDatabase from '@/lib/db';
import { logDataChange } from '@/lib/audit';
import mongoose from 'mongoose';

// Mock dependencies
jest.mock('@/lib/db');
jest.mock('@/models/FiscalYear');
jest.mock('@/models/PettyCashTransaction');
jest.mock('@/lib/audit');

describe('FiscalYearService', () => {
    let service: FiscalYearService;
    let mockSession: any;

    beforeEach(() => {
        service = new FiscalYearService();

        // Reset all mocks
        jest.clearAllMocks();

        // Mock session for transactions
        mockSession = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn(),
        };
        jest.spyOn(mongoose, 'startSession').mockResolvedValue(mockSession as any);
    });

    describe('createFiscalYear', () => {
        const validData: FiscalYearData = {
            name: 'FY 2026-27',
            startDate: new Date('2026-04-01'),
            endDate: new Date('2027-03-31'),
            isCurrent: false,
        };

        it('should create a fiscal year successfully', async () => {
            const mockFY = {
                _id: 'fy123',
                ...validData,
            };

            (FiscalYear.create as jest.Mock).mockResolvedValue(mockFY);

            const result = await service.createFiscalYear(validData, 'user123');

            expect(connectToDatabase).toHaveBeenCalled();
            expect(FiscalYear.create).toHaveBeenCalledWith({
                ...validData,
                startDate: expect.any(Date),
                endDate: expect.any(Date),
            });
            expect(logDataChange).toHaveBeenCalledWith(
                'create',
                'FiscalYear',
                'fy123',
                'user123',
                { name: 'FY 2026-27' }
            );
            expect(result).toEqual(mockFY);
        });

        it('should create fiscal year without userId (no audit log)', async () => {
            const mockFY = {
                _id: 'fy124',
                ...validData,
            };

            (FiscalYear.create as jest.Mock).mockResolvedValue(mockFY);

            await service.createFiscalYear(validData);

            expect(FiscalYear.create).toHaveBeenCalled();
            expect(logDataChange).not.toHaveBeenCalled();
        });
    });

    describe('getAllFiscalYears', () => {
        it('should retrieve all fiscal years sorted by start date', async () => {
            const mockYears = [
                { _id: 'fy1', name: 'FY 2026-27', startDate: new Date('2026-04-01') },
                { _id: 'fy2', name: 'FY 2025-26', startDate: new Date('2025-04-01') },
            ];

            (FiscalYear.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockYears),
                }),
            });

            const result = await service.getAllFiscalYears();

            expect(FiscalYear.find).toHaveBeenCalledWith({});
            expect(result).toEqual(mockYears);
        });

        it('should sort fiscal years by startDate descending', async () => {
            const sortMock = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([]),
            });

            (FiscalYear.find as jest.Mock).mockReturnValue({
                sort: sortMock,
            });

            await service.getAllFiscalYears();

            expect(sortMock).toHaveBeenCalledWith({ startDate: -1 });
        });
    });

    describe('setCurrentFiscalYear', () => {
        it('should set a fiscal year as current', async () => {
            await service.setCurrentFiscalYear('fy123', 'user123');

            expect(mockSession.startTransaction).toHaveBeenCalled();
            expect(FiscalYear.updateMany).toHaveBeenCalledWith(
                {},
                { isCurrent: false },
                { session: mockSession }
            );
            expect(FiscalYear.findByIdAndUpdate).toHaveBeenCalledWith(
                'fy123',
                { isCurrent: true },
                { session: mockSession }
            );
            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
            expect(logDataChange).toHaveBeenCalledWith(
                'update',
                'FiscalYear',
                'fy123',
                'user123',
                { action: 'set_current' }
            );
        });

        it('should rollback on error', async () => {
            (FiscalYear.updateMany as jest.Mock).mockRejectedValue(new Error('Database error'));

            await expect(service.setCurrentFiscalYear('fy123', 'user123')).rejects.toThrow(
                'Database error'
            );

            expect(mockSession.abortTransaction).toHaveBeenCalled();
            expect(mockSession.commitTransaction).not.toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
        });

        it('should work without userId (no audit log)', async () => {
            await service.setCurrentFiscalYear('fy123');

            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(logDataChange).not.toHaveBeenCalled();
        });
    });

    describe('closeFiscalYear', () => {
        const mockFiscalYear = {
            _id: 'fy123',
            name: 'FY 2025-26',
            startDate: new Date('2025-04-01'),
            endDate: new Date('2026-03-31'),
            status: 'Active',
        };

        const mockNextFiscalYear = {
            _id: 'fy124',
            name: 'FY 2026-27',
            startDate: new Date('2026-04-01'),
            endDate: new Date('2027-03-31'),
        };

        const mockTransactions = [
            {
                location: 'Mumbai',
                paymentMode: 'Cash',
                type: 'Income',
                amount: 10000,
                status: 'Approved',
            },
            {
                location: 'Mumbai',
                paymentMode: 'Cash',
                type: 'Expense',
                amount: 3000,
                status: 'Approved',
            },
            {
                location: 'Delhi',
                paymentMode: 'Bank',
                type: 'Income',
                amount: 5000,
                status: 'Approved',
            },
        ];

        beforeEach(() => {
            (FiscalYear.findById as jest.Mock).mockReturnValue({
                session: jest.fn().mockResolvedValue(mockFiscalYear),
            });

            (FiscalYear.findOne as jest.Mock).mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    session: jest.fn().mockResolvedValue(mockNextFiscalYear),
                }),
            });

            (PettyCashTransaction.find as jest.Mock).mockReturnValue({
                lean: jest.fn().mockResolvedValue(mockTransactions),
            });
        });

        it('should close fiscal year and create opening balances', async () => {
            const result = await service.closeFiscalYear('fy123', 'user123');

            expect(mockSession.startTransaction).toHaveBeenCalled();

            // Verify fiscal year was found
            expect(FiscalYear.findById).toHaveBeenCalledWith('fy123');

            // Verify transactions were queried
            expect(PettyCashTransaction.find).toHaveBeenCalledWith({
                date: {
                    $gte: mockFiscalYear.startDate,
                    $lte: mockFiscalYear.endDate,
                },
                status: 'Approved',
            });

            // Verify fiscal year status was updated
            expect(FiscalYear.findByIdAndUpdate).toHaveBeenCalledWith(
                'fy123',
                { status: 'Closed' },
                { session: mockSession }
            );

            // Verify opening balances were created
            expect(PettyCashTransaction.insertMany).toHaveBeenCalled();
            const insertedBalances = (PettyCashTransaction.insertMany as jest.Mock).mock.calls[0][0];
            expect(insertedBalances).toHaveLength(2); // Mumbai-Cash and Delhi-Bank

            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();

            expect(result).toEqual({
                success: true,
                message: expect.stringContaining('Fiscal year closed successfully'),
            });

            expect(logDataChange).toHaveBeenCalledWith(
                'update',
                'FiscalYear',
                'fy123',
                'user123',
                expect.objectContaining({
                    action: 'close',
                    closingBalancesCount: 2,
                })
            );
        });

        it('should calculate closing balances correctly', async () => {
            await service.closeFiscalYear('fy123', 'user123');

            const insertedBalances = (PettyCashTransaction.insertMany as jest.Mock).mock.calls[0][0];

            // Mumbai-Cash: Income 10000 - Expense 3000 = 7000 (debit)
            const mumbaiCash = insertedBalances.find((b: any) =>
                b.location === 'Mumbai' && b.paymentMode === 'Cash'
            );
            expect(mumbaiCash).toBeDefined();
            expect(mumbaiCash.amount).toBe(7000);
            expect(mumbaiCash.type).toBe('Income'); // debit type

            // Delhi-Bank: Income 5000 = 5000 (debit)
            const delhiBank = insertedBalances.find((b: any) =>
                b.location === 'Delhi' && b.paymentMode === 'Bank'
            );
            expect(delhiBank).toBeDefined();
            expect(delhiBank.amount).toBe(5000);
            expect(delhiBank.type).toBe('Income');
        });

        it('should handle closing without next fiscal year', async () => {
            (FiscalYear.findOne as jest.Mock).mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    session: jest.fn().mockResolvedValue(null), // No next FY
                }),
            });

            const result = await service.closeFiscalYear('fy123', 'user123');

            expect(PettyCashTransaction.insertMany).not.toHaveBeenCalled();
            expect(result.message).not.toContain('carried forward');
            expect(mockSession.commitTransaction).toHaveBeenCalled();
        });

        it('should throw error if fiscal year not found', async () => {
            (FiscalYear.findById as jest.Mock).mockReturnValue({
                session: jest.fn().mockResolvedValue(null),
            });

            await expect(service.closeFiscalYear('invalid-id', 'user123')).rejects.toThrow(
                'Fiscal year not found'
            );

            expect(mockSession.abortTransaction).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
        });

        it('should throw error if fiscal year already closed', async () => {
            const closedFY = { ...mockFiscalYear, status: 'Closed' };
            (FiscalYear.findById as jest.Mock).mockReturnValue({
                session: jest.fn().mockResolvedValue(closedFY),
            });

            await expect(service.closeFiscalYear('fy123', 'user123')).rejects.toThrow(
                'Fiscal year is already closed'
            );

            expect(mockSession.abortTransaction).toHaveBeenCalled();
        });

        it('should rollback on error during closing', async () => {
            (FiscalYear.findByIdAndUpdate as jest.Mock).mockRejectedValue(
                new Error('Database error')
            );

            await expect(service.closeFiscalYear('fy123', 'user123')).rejects.toThrow(
                'Database error'
            );

            expect(mockSession.abortTransaction).toHaveBeenCalled();
            expect(mockSession.commitTransaction).not.toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
        });

        it('should create opening balances with correct structure', async () => {
            await service.closeFiscalYear('fy123', 'user123');

            const insertedBalances = (PettyCashTransaction.insertMany as jest.Mock).mock.calls[0][0];
            const balance = insertedBalances[0];

            expect(balance).toMatchObject({
                subsidiary: 'Opening Balance',
                party: 'Opening Balance',
                category: 'Opening Balance',
                reference: `OB-${mockNextFiscalYear.name}`,
                status: 'Approved',
                date: mockNextFiscalYear.startDate,
            });
            expect(balance.remarks).toContain('Opening balance from FY');
        });

        it('should handle negative balances (credit type)', async () => {
            const expenseHeavyTransactions = [
                {
                    location: 'Mumbai',
                    paymentMode: 'Cash',
                    type: 'Income',
                    amount: 1000,
                    status: 'Approved',
                },
                {
                    location: 'Mumbai',
                    paymentMode: 'Cash',
                    type: 'Expense',
                    amount: 5000,
                    status: 'Approved',
                },
            ];

            (PettyCashTransaction.find as jest.Mock).mockReturnValue({
                lean: jest.fn().mockResolvedValue(expenseHeavyTransactions),
            });

            await service.closeFiscalYear('fy123', 'user123');

            const insertedBalances = (PettyCashTransaction.insertMany as jest.Mock).mock.calls[0][0];
            const mumbaiCash = insertedBalances[0];

            // Income 1000 - Expense 5000 = -4000 (credit)
            expect(mumbaiCash.amount).toBe(4000); // Absolute value
            expect(mumbaiCash.type).toBe('Expense'); // credit type
        });

        it('should only include approved transactions', async () => {
            await service.closeFiscalYear('fy123', 'user123');

            expect(PettyCashTransaction.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'Approved',
                })
            );
        });
    });
});
