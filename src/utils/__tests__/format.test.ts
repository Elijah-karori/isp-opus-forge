import { describe, it, expect } from 'vitest';
import {
    formatDateForAPI,
    formatDateForDisplay,
    formatDateTimeForDisplay,
    getRelativeTime,
    formatCurrency,
    formatNumber,
    formatPercentage,
    formatPhoneForDisplay,
    formatName,
    getInitials,
    formatFileSize,
    formatStatus,
    truncateText,
    formatDuration
} from '../format';

describe('Format Utilities', () => {
    describe('Date Formatting', () => {
        const testDate = new Date('2023-11-25T10:30:00');

        it('formats date for API', () => {
            expect(formatDateForAPI(testDate)).toBe('2023-11-25');
        });

        it('formats date for display', () => {
            expect(formatDateForDisplay(testDate)).toBe('Nov 25, 2023');
        });

        it('formats datetime for display', () => {
            expect(formatDateTimeForDisplay(testDate)).toBe('Nov 25, 2023, 10:30 AM');
        });

        it('gets relative time', () => {
            const now = new Date();
            expect(getRelativeTime(now)).toBe('just now');

            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
            expect(getRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');

            const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
            expect(getRelativeTime(twoHoursAgo)).toBe('2 hours ago');
        });
    });

    describe('Currency Formatting', () => {
        it('formats currency in KES by default', () => {
            expect(formatCurrency(1000)).toMatch(/(KES|Ksh)\s?1,000.00/);
        });

        it('formats currency with custom currency code', () => {
            expect(formatCurrency(1000, 'USD')).toMatch(/\$1,000.00/);
        });

        it('handles string input', () => {
            expect(formatCurrency('1000')).toMatch(/(KES|Ksh)\s?1,000.00/);
        });
    });

    describe('Number Formatting', () => {
        it('formats number with commas', () => {
            expect(formatNumber(1234567)).toBe('1,234,567');
        });

        it('formats percentage', () => {
            expect(formatPercentage(50.5)).toBe('50.5%');
            expect(formatPercentage(50.56, 2)).toBe('50.56%');
        });
    });

    describe('Phone Formatting', () => {
        it('formats 254 numbers', () => {
            expect(formatPhoneForDisplay('254712345678')).toBe('+254 712 345 678');
        });

        it('formats 07 numbers', () => {
            expect(formatPhoneForDisplay('0712345678')).toBe('0712 345 678');
        });

        it('returns original if no match', () => {
            expect(formatPhoneForDisplay('123')).toBe('123');
        });
    });

    describe('Name Formatting', () => {
        it('formats name to title case', () => {
            expect(formatName('JOHN DOE')).toBe('John Doe');
            expect(formatName('john doe')).toBe('John Doe');
        });

        it('gets initials', () => {
            expect(getInitials('John Doe')).toBe('JD');
            expect(getInitials('John')).toBe('J');
        });
    });

    describe('File Size Formatting', () => {
        it('formats bytes', () => {
            expect(formatFileSize(0)).toBe('0 Bytes');
            expect(formatFileSize(1024)).toBe('1 KB');
            expect(formatFileSize(1024 * 1024)).toBe('1 MB');
        });
    });

    describe('Status Formatting', () => {
        it('formats status string', () => {
            expect(formatStatus('in_progress')).toBe('In Progress');
            expect(formatStatus('pending_approval')).toBe('Pending Approval');
        });
    });

    describe('Text Truncation', () => {
        it('truncates text', () => {
            expect(truncateText('Hello World', 5)).toBe('Hello...');
            expect(truncateText('Hello', 10)).toBe('Hello');
        });
    });

    describe('Duration Formatting', () => {
        it('formats duration', () => {
            expect(formatDuration(30)).toBe('30s');
            expect(formatDuration(90)).toBe('1m 30s');
            expect(formatDuration(3665)).toBe('1h 1m');
        });
    });
});
