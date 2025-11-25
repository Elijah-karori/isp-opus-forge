/**
 * Error Handler Utilities
 * 
 * Common error handling functions for API responses
 */

import { toast } from 'sonner';

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ValidationError {
    field: string;
    message: string;
}

export interface APIError {
    status: number;
    detail: string | ValidationError[];
}

// ============================================================================
// ERROR EXTRACTION
// ============================================================================

/**
 * Extract error message from API response
 */
export const getErrorMessage = (error: any): string => {
    // Axios error
    if (error.response?.data?.detail) {
        const detail = error.response.data.detail;

        // Validation errors (422)
        if (Array.isArray(detail)) {
            return detail.map(err => `${err.field}: ${err.message}`).join(', ');
        }

        // Simple error message
        if (typeof detail === 'string') {
            return detail;
        }
    }

    // Network error
    if (error.message) {
        return error.message;
    }

    return 'An unexpected error occurred';
};

/**
 * Extract validation errors from API response
 */
export const getValidationErrors = (error: any): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        error.response.data.detail.forEach((err: ValidationError) => {
            errors[err.field] = err.message;
        });
    }

    return errors;
};

/**
 * Check if error is a validation error (422)
 */
export const isValidationError = (error: any): boolean => {
    return error.response?.status === 422 &&
        Array.isArray(error.response?.data?.detail);
};

/**
 * Check if error is an authentication error (401)
 */
export const isAuthError = (error: any): boolean => {
    return error.response?.status === 401;
};

/**
 * Check if error is a permission error (403)
 */
export const isPermissionError = (error: any): boolean => {
    return error.response?.status === 403;
};

/**
 * Check if error is a not found error (404)
 */
export const isNotFoundError = (error: any): boolean => {
    return error.response?.status === 404;
};

/**
 * Check if error is a server error (500)
 */
export const isServerError = (error: any): boolean => {
    return error.response?.status >= 500;
};

// ============================================================================
// ERROR HANDLING WITH TOAST
// ============================================================================

/**
 * Handle API error and show toast notification
 */
export const handleAPIError = (error: any, defaultMessage?: string): void => {
    console.error('API Error:', error);

    // Authentication error - redirect to login
    if (isAuthError(error)) {
        toast.error('Session expired. Please login again.');
        // Optionally trigger logout
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
        return;
    }

    // Permission error
    if (isPermissionError(error)) {
        toast.error('You do not have permission to perform this action.');
        return;
    }

    // Not found error
    if (isNotFoundError(error)) {
        toast.error('Resource not found.');
        return;
    }

    // Validation error
    if (isValidationError(error)) {
        const errors = getValidationErrors(error);
        const errorMessages = Object.values(errors);
        if (errorMessages.length > 0) {
            toast.error(errorMessages[0]); // Show first error
        }
        return;
    }

    // Server error
    if (isServerError(error)) {
        toast.error('Server error. Please try again later.');
        return;
    }

    // Generic error
    const message = getErrorMessage(error);
    toast.error(defaultMessage || message);
};

/**
 * Handle success response with toast
 */
export const handleAPISuccess = (message: string): void => {
    toast.success(message);
};

// ============================================================================
// ERROR LOGGING
// ============================================================================

/**
 * Log error to console with context
 */
export const logError = (context: string, error: any): void => {
    console.error(`[${context}] Error:`, {
        message: getErrorMessage(error),
        status: error.response?.status,
        data: error.response?.data,
        error
    });
};

/**
 * Log error to external service (e.g., Sentry)
 */
export const reportError = (context: string, error: any): void => {
    // TODO: Integrate with error reporting service
    // Example: Sentry.captureException(error, { tags: { context } });

    console.error(`[${context}] Reported Error:`, error);
};

// ============================================================================
// RETRY LOGIC
// ============================================================================

/**
 * Retry failed API call with exponential backoff
 */
export const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> => {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry on 4xx errors (except 429 rate limit)
            if (error.response?.status >= 400 &&
                error.response?.status < 500 &&
                error.response?.status !== 429) {
                throw error;
            }

            // Wait before retrying
            if (i < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, i); // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
};

// ============================================================================
// NETWORK STATUS
// ============================================================================

/**
 * Check if error is due to network connectivity
 */
export const isNetworkError = (error: any): boolean => {
    return !error.response && error.message === 'Network Error';
};

/**
 * Handle network error
 */
export const handleNetworkError = (): void => {
    toast.error('Network error. Please check your internet connection.');
};
