import { exportToCSV, handlePrint } from '@/lib/export-utils';

describe('Export Utilities', () => {
    describe('exportToCSV', () => {
        let createElementSpy: jest.SpyInstance;
        let appendChildSpy: jest.SpyInstance;
        let removeChildSpy: jest.SpyInstance;
        let createObjectURLSpy: jest.SpyInstance;
        let mockLink: any;

        beforeEach(() => {
            // Mock DOM elements and methods
            mockLink = {
                setAttribute: jest.fn(),
                click: jest.fn(),
                style: {},
                download: 'test',
            };

            // Add createObjectURL to URL if it doesn't exist (jsdom doesn't have it)
            if (!URL.createObjectURL) {
                URL.createObjectURL = jest.fn();
            }

            createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
            appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation();
            removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation();
            createObjectURLSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');

            // Mock console.warn to avoid noise in test output
            jest.spyOn(console, 'warn').mockImplementation();
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should export simple data to CSV', () => {
            const data = [
                { name: 'John Doe', age: 30, city: 'New York' },
                { name: 'Jane Smith', age: 25, city: 'Los Angeles' },
            ];

            exportToCSV(data, 'users');

            expect(createElementSpy).toHaveBeenCalledWith('a');
            expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'blob:mock-url');
            expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'users.csv');
            expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
            expect(mockLink.click).toHaveBeenCalled();
            expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
        });

        it('should handle data with commas in values', () => {
            const data = [
                { name: 'Doe, John', company: 'ABC, Inc.' },
            ];

            exportToCSV(data, 'test');

            // Verify Blob was created (we can't easily inspect its contents in Jest)
            expect(createObjectURLSpy).toHaveBeenCalled();
            expect(mockLink.click).toHaveBeenCalled();
        });

        it('should handle data with quotes in values', () => {
            const data = [
                { description: 'He said "Hello"', notes: 'Test "quoted" text' },
            ];

            exportToCSV(data, 'test');

            expect(createObjectURLSpy).toHaveBeenCalled();
            expect(mockLink.click).toHaveBeenCalled();
        });

        it('should handle null and undefined values', () => {
            const data = [
                { name: 'John', email: null, phone: undefined },
            ];

            exportToCSV(data, 'test');

            expect(createObjectURLSpy).toHaveBeenCalled();
            expect(mockLink.click).toHaveBeenCalled();
        });

        it('should handle empty data array', () => {
            const data: any[] = [];

            exportToCSV(data, 'empty');

            expect(console.warn).toHaveBeenCalledWith('No data to export');
            expect(createElementSpy).not.toHaveBeenCalled();
        });

        it('should handle null data', () => {
            exportToCSV(null as any, 'null-data');

            expect(console.warn).toHaveBeenCalledWith('No data to export');
            expect(createElementSpy).not.toHaveBeenCalled();
        });

        it('should handle undefined data', () => {
            exportToCSV(undefined as any, 'undefined-data');

            expect(console.warn).toHaveBeenCalledWith('No data to export');
            expect(createElementSpy).not.toHaveBeenCalled();
        });

        it('should use correct filename', () => {
            const data = [{ id: 1 }];

            exportToCSV(data, 'my-export-file');

            expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'my-export-file.csv');
        });

        it('should handle data with mixed types', () => {
            const data = [
                { name: 'John', age: 30, active: true, score: 95.5 },
                { name: 'Jane', age: 25, active: false, score: 88.2 },
            ];

            exportToCSV(data, 'mixed-types');

            expect(createObjectURLSpy).toHaveBeenCalled();
            expect(mockLink.click).toHaveBeenCalled();
        });

        it('should handle single row of data', () => {
            const data = [
                { id: 1, name: 'Single Row' },
            ];

            exportToCSV(data, 'single-row');

            expect(createObjectURLSpy).toHaveBeenCalled();
            expect(mockLink.click).toHaveBeenCalled();
        });

        it('should set link visibility to hidden', () => {
            const data = [{ test: 'data' }];

            exportToCSV(data, 'test');

            expect(mockLink.style.visibility).toBe('hidden');
        });

        it('should create blob with correct MIME type', () => {
            const data = [{ test: 'data' }];

            // Mock Blob constructor
            const mockBlob = { type: 'text/csv;charset=utf-8;' };
            global.Blob = jest.fn().mockImplementation((content, options) => {
                return { ...mockBlob, ...options };
            }) as any;

            exportToCSV(data, 'test');

            expect(global.Blob).toHaveBeenCalledWith(
                expect.any(Array),
                { type: 'text/csv;charset=utf-8;' }
            );
        });
    });

    describe('handlePrint', () => {
        it('should call window.print', () => {
            const printSpy = jest.spyOn(window, 'print').mockImplementation();

            handlePrint();

            expect(printSpy).toHaveBeenCalled();

            printSpy.mockRestore();
        });
    });
});
