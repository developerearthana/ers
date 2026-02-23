// Manual mock for mongoose to avoid ESM issues
const mockObjectId = jest.fn((id?: string) => id || 'mock-id');

const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
};

const mongoose = {
    connect: jest.fn(),
    connection: {
        readyState: 1,
    },
    startSession: jest.fn(() => Promise.resolve(mockSession)),
    Types: {
        ObjectId: mockObjectId,
    },
    Schema: jest.fn(),
    model: jest.fn(),
};

export default mongoose;
export { mockSession };
