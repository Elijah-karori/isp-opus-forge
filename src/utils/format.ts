/**
 * Format Utilities
 * 
 * Common formatting functions for displaying data
 */

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format date for API (YYYY-MM-DD)
 */
export const formatDateForAPI = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Format date for display (e.g., "Nov 25, 2025")
 */
export const formatDateForDisplay = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Format datetime for display (e.g., "Nov 25, 2025 10:30 AM")
 */
export const formatDateTimeForDisplay = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Get relative time (e.g., "2 hours ago", "3 days ago")
 */
export const getRelativeTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

    return formatDateForDisplay(d);
};

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

/**
 * Format currency (KES)
 */
export const formatCurrency = (amount: number | string, currency: string = 'KES'): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;

    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
};

/**
 * Format number with commas (e.g., 1,234,567)
 */
export const formatNumber = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
};

// ============================================================================
// PHONE NUMBER FORMATTING
// ============================================================================

/**
 * Format phone for display (+254 712 345 678)
 */
export const formatPhoneForDisplay = (phone: string): string => {
    // Remove any existing formatting
    const cleaned = phone.replace(/\D/g, '');

    // Check if it starts with 254
    if (cleaned.startsWith('254')) {
        const countryCode = cleaned.substring(0, 3);
        const part1 = cleaned.substring(3, 6);
        const part2 = cleaned.substring(6, 9);
        const part3 = cleaned.substring(9, 12);
        return `+${countryCode} ${part1} ${part2} ${part3}`;
    }

    // Check if it starts with 0
    if (cleaned.startsWith('0')) {
        const part1 = cleaned.substring(0, 4);
        const part2 = cleaned.substring(4, 7);
        const part3 = cleaned.substring(7, 10);
        return `${part1} ${part2} ${part3}`;
    }

    return phone;
};

// ============================================================================
// NAME FORMATTING
// ============================================================================

/**
 * Format name (Title Case)
 */
export const formatName = (name: string): string => {
    return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
};

// ============================================================================
// FILE SIZE FORMATTING
// ============================================================================

/**
 * Format file size (bytes to human readable)
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// ============================================================================
// STATUS FORMATTING
// ============================================================================

/**
 * Format status for display (e.g., "in_progress" -> "In Progress")
 */
export const formatStatus = (status: string): string => {
    return status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// ============================================================================
// TRUNCATE TEXT
// ============================================================================

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// ============================================================================
// DURATION FORMATTING
// ============================================================================

/**
 * Format duration in seconds to readable format
 */
export const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
};
