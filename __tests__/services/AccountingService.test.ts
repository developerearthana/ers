import { AccountingService, PettyCashData } from '@/services/AccountingService';
import connectToDatabase from '@/lib/db';
import { logDataChange } from '@/lib/audit';
import { sanitizeObject } from '@/lib/sanitize';

// Mock dependencies
jest.mock('@/lib/db');
jest.mock('@/lib/audit');
jest.mock('@/lib/sanitize');
jest.mock('mongoose'); // Use manual mock

// Mock the model
const mockPettyCashTransaction = {
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
};

jest.mock('@/models/PettyCashTransaction', () => mockPettyCashTransaction);

describe('AccountingService', () => {
    let service: AccountingService;

    beforeEach(() => {
        service = new AccountingService();

        // Reset all mocks
        jest.clearAllMocks();

        // Mock sanitizeObject to return input as-is
        (sanitizeObject as jest.Mock).mockImplementation((data) => data);
    });

    describe('createPettyCashEntry', () => {
        const validData: PettyCashData = {
            subsidiary: 'Main Office',
            location: 'Mumbai',
            type: 'Expense',
            party: 'Office Supplies Ltd',
            category: 'Stationery',
            reference: 'INV-001',
            date: '2026-01-12',
            amount: 5000,
            remarks: 'Monthly stationery purchase',
            paymentMode: 'Cash',
            createdBy: 'user123',
        };

        it('should create a petty cash entry successfully', async () => {
            const mockTransaction = {
                _id: 'txn123',
                ...validData,
                status: 'Pending',
                date: new Date(validData.date),
            };

            mockPettyCashTransaction.create.mockResolvedValue(mockTransaction);

            const result = await service.createPettyCashEntry(validData, 'user123');

            expect(connectToDatabase).toHaveBeenCalled();
            expect(sanitizeObject).toHaveBeenCalledWith(validData);
            expect(mockPettyCashTransaction.create).toHaveBeenCalledWith({
                ...validData,
                amount: 5000,
                date: expect.any(Date),
                status: 'Pending',
                createdBy: 'user123',
            });
            expect(logDataChange).toHaveBeenCalledWith(
                'create',
                'PettyCashTransaction',
                'txn123',
                'user123',
                expect.objectContaining({
                    type: 'Expense',
                    amount: 5000,
                    party: 'Office Supplies Ltd',
                })
            );
            expect(result).toEqual(mockTransaction);
        });

        it('should throw error for expense with zero or negative amount', async () => {
            const invalidData: PettyCashData = {
                ...validData,
                amount: 0,
            };

            await expect(service.createPettyCashEntry(invalidData, 'user123')).rejects.toThrow(
                'Expense amount must be greater than 0'
            );

            expect(mockPettyCashTransaction.create).not.toHaveBeenCalled();
        });

        it('should handle string amount conversion', async () => {
            const dataWithStringAmount = {
                ...validData,
                amount: '5000.50' as any,
            };

            const mockTransaction = {
                _id: 'txn124',
                ...dataWithStringAmount,
                status: 'Pending',
            };

            mockPettyCashTransaction.create.mockResolvedValue(mockTransaction);

            await service.createPettyCashEntry(dataWithStringAmount, 'user123');

            expect(mockPettyCashTransaction.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    amount: 5000.50,
                })
            );
        });

        it('should create entry without userId (no audit log)', async () => {
            const mockTransaction = {
                _id: 'txn125',
                ...validData,
                status: 'Pending',
            };

            mockPettyCashTransaction.create.mockResolvedValue(mockTransaction);

            await service.createPettyCashEntry(validData);

            expect(mockPettyCashTransaction.create).toHaveBeenCalled();
            expect(logDataChange).not.toHaveBeenCalled();
        });

        it('should allow income with any amount', async () => {
            const incomeData: PettyCashData = {
                ...validData,
                type: 'Income',
                amount: 0,
            };

            const mockTransaction = {
                _id: 'txn126',
                ...incomeData,
                status: 'Pending',
            };

            mockPettyCashTransaction.create.mockResolvedValue(mockTransaction);

            await service.createPettyCashEntry(incomeData, 'user123');

            expect(mockPettyCashTransaction.create).toHaveBeenCalled();
        });
    });

    describe('approvePettyCashEntry', () => {
        it('should approve a pending transaction', async () => {
            const mockTransaction = {
                _id: 'txn123',
                status: 'Pending',
                approvedBy: undefined,
                approvalDate: undefined,
                save: jest.fn().mockResolvedValue(true),
            };

            const mockSession = {
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                abortTransaction: jest.fn(),
                endSession: jest.fn(),
            };

            mockPettyCashTransaction.findById.mockReturnValue({
                session: jest.fn().mockResolvedValue(mockTransaction),
            });

            // Mock mongoose.startSession
            const mongoose = require('mongoose');
            mongoose.startSession.mockResolvedValue(mockSession);

            await service.approvePettyCashEntry('txn123', 'approver123');

            expect(mockSession.startTransaction).toHaveBeenCalled();
            expect(mockTransaction.status).toBe('Approved');
            expect(mockTransaction.approvedBy).toBeDefined();
            expect(mockTransaction.approvalDate).toBeInstanceOf(Date);
            expect(mockTransaction.save).toHaveBeenCalledWith({ session: mockSession });
            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
            expect(logDataChange).toHaveBeenCalledWith(
                'update',
                'PettyCashTransaction',
                'txn123',
                'approver123',
                { action: 'approve' }
            );
        });

        it('should throw error if transaction not found', async () => {
            const mockSession = {
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                abortTransaction: jest.fn(),
                endSession: jest.fn(),
            };

            mockPettyCashTransaction.findById.mockReturnValue({
                session: jest.fn().mockResolvedValue(null),
            });

            const mongoose = require('mongoose');
            mongoose.startSession.mockResolvedValue(mockSession);

            await expect(service.approvePettyCashEntry('invalid-id', 'approver123')).rejects.toThrow(
                'Transaction not found'
            );

            expect(mockSession.abortTransaction).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
        });

        it('should throw error if transaction is not pending', async () => {
            const mockTransaction = {
                _id: 'txn123',
                status: 'Approved',
            };

            const mockSession = {
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                abortTransaction: jest.fn(),
                endSession: jest.fn(),
            };

            mockPettyCashTransaction.findById.mockReturnValue({
                session: jest.fn().mockResolvedValue(mockTransaction),
            });

            const mongoose = require('mongoose');
            mongoose.startSession.mockResolvedValue(mockSession);

            await expect(service.approvePettyCashEntry('txn123', 'approver123')).rejects.toThrow(
                'Transaction is not pending approval'
            );

            expect(mockSession.abortTransaction).toHaveBeenCalled();
        });
    });

    describe('rejectPettyCashEntry', () => {
        it('should reject a pending transaction with reason', async () => {
            const mockTransaction = {
                _id: 'txn123',
                status: 'Pending',
                remarks: 'Original remarks',
                approvedBy: undefined,
                approvalDate: undefined,
                save: jest.fn().mockResolvedValue(true),
            };

            mockPettyCashTransaction.findById.mockResolvedValue(mockTransaction);

            await service.rejectPettyCashEntry('txn123', 'approver123', 'Insufficient documentation');

            expect(mockTransaction.status).toBe('Rejected');
            expect(mockTransaction.approvedBy).toBeDefined();
            expect(mockTransaction.approvalDate).toBeInstanceOf(Date);
            expect(mockTransaction.remarks).toContain('Rejection reason: Insufficient documentation');
            expect(mockTransaction.save).toHaveBeenCalled();
            expect(logDataChange).toHaveBeenCalledWith(
                'update',
                'PettyCashTransaction',
                'txn123',
                'approver123',
                {
                    action: 'reject',
                    reason: 'Insufficient documentation',
                }
            );
        });

        it('should reject transaction without reason', async () => {
            const mockTransaction = {
                _id: 'txn123',
                status: 'Pending',
                approvedBy: undefined,
                approvalDate: undefined,
                save: jest.fn().mockResolvedValue(true),
            };

            mockPettyCashTransaction.findById.mockResolvedValue(mockTransaction);

            await service.rejectPettyCashEntry('txn123', 'approver123');

            expect(mockTransaction.status).toBe('Rejected');
            expect(mockTransaction.save).toHaveBeenCalled();
        });

        it('should throw error if transaction not found', async () => {
            mockPettyCashTransaction.findById.mockResolvedValue(null);

            await expect(service.rejectPettyCashEntry('invalid-id', 'approver123')).rejects.toThrow(
                'Transaction not found'
            );
        });

        it('should throw error if transaction is not pending', async () => {
            const mockTransaction = {
                status: 'Rejected',
            };

            mockPettyCashTransaction.findById.mockResolvedValue(mockTransaction);

            await expect(service.rejectPettyCashEntry('txn123', 'approver123')).rejects.toThrow(
                'Transaction is not pending approval'
            );
        });
    });

    describe('getTransactionsByStatus', () => {
        it('should retrieve transactions by status', async () => {
            const mockTransactions = [
                { _id: 'txn1', status: 'Pending', amount: 1000 },
                { _id: 'txn2', status: 'Pending', amount: 2000 },
            ];

            mockPettyCashTransaction.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockTransactions),
                }),
            });

            const result = await service.getTransactionsByStatus('Pending');

            expect(mockPettyCashTransaction.find).toHaveBeenCalledWith({ status: 'Pending' });
            expect(result).toEqual(mockTransactions);
        });

        it('should sort transactions by date descending', async () => {
            const sortMock = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([]),
            });

            mockPettyCashTransaction.find.mockReturnValue({
                sort: sortMock,
            });

            await service.getTransactionsByStatus('Approved');

            expect(sortMock).toHaveBeenCalledWith({ date: -1 });
        });
    });

    describe('getTransactionsByDateRange', () => {
        it('should retrieve transactions within date range', async () => {
            const startDate = new Date('2026-01-01');
            const endDate = new Date('2026-01-31');
            const mockTransactions = [
                { _id: 'txn1', date: new Date('2026-01-15'), amount: 1000 },
                { _id: 'txn2', date: new Date('2026-01-20'), amount: 2000 },
            ];

            mockPettyCashTransaction.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockTransactions),
                }),
            });

            const result = await service.getTransactionsByDateRange(startDate, endDate);

            expect(mockPettyCashTransaction.find).toHaveBeenCalledWith({
                date: {
                    $gte: startDate,
                    $lte: endDate,
                },
            });
            expect(result).toEqual(mockTransactions);
        });
    });
});
