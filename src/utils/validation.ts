/**
 * Validation Utilities
 * 
 * Common validation functions for forms and data
 */

// ============================================================================
// EMAIL VALIDATION
// ============================================================================
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const getEmailError = (email: string): string | null => {
    if (!email) return 'Email is required';
    if (!validateEmail(email)) return 'Invalid email format';
    return null;
};

// ============================================================================
// PHONE NUMBER VALIDATION (Kenya)
// ============================================================================
export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    return phoneRegex.test(phone);
};

export const getPhoneError = (phone: string): string | null => {
    if (!phone) return 'Phone number is required';
    if (!validatePhone(phone)) {
        return 'Invalid phone number. Use format: +254712345678 or 0712345678';
    }
    return null;
};

export const formatPhoneForAPI = (phone: string): string => {
    // Convert 0712345678 to +254712345678
    if (phone.startsWith('0')) {
        return '+254' + phone.substring(1);
    }
    return phone;
};

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================
export const validatePassword = (password: string): boolean => {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[!@#$%^&*]/.test(password)) return false;
    return true;
};

export const getPasswordError = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain a number';
    if (!/[!@#$%^&*]/.test(password)) return 'Password must contain special character';
    return null;
};

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    if (score <= 3) return 'weak';
    if (score <= 5) return 'medium';
    return 'strong';
};

// ============================================================================
// DATE VALIDATION
// ============================================================================
export const validateDate = (dateStr: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) return false;

    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
};

export const getDateError = (dateStr: string): string | null => {
    if (!dateStr) return 'Date is required';
    if (!validateDate(dateStr)) return 'Invalid date format. Use YYYY-MM-DD';
    return null;
};

// ============================================================================
// EMPLOYEE CODE VALIDATION
// ============================================================================
export const validateEmployeeCode = (code: string): boolean => {
    const codeRegex = /^EMP\d{5}$/;
    return codeRegex.test(code);
};

export const getEmployeeCodeError = (code: string): string | null => {
    if (!code) return 'Employee code is required';
    if (!validateEmployeeCode(code)) {
        return 'Invalid employee code. Use format: EMP00001';
    }
    return null;
};

export const generateEmployeeCode = (lastCode?: string): string => {
    if (!lastCode) return 'EMP00001';

    const match = lastCode.match(/^EMP(\d{5})$/);
    if (!match) return 'EMP00001';

    const num = parseInt(match[1], 10) + 1;
    return `EMP${num.toString().padStart(5, '0')}`;
};

// ============================================================================
// CURRENCY VALIDATION
// ============================================================================
export const validateCurrency = (value: any): boolean => {
    if (typeof value === 'number') return value >= 0;
    if (typeof value === 'string') {
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0;
    }
    return false;
};

export const getCurrencyError = (value: any, fieldName: string = 'Amount'): string | null => {
    if (value === null || value === undefined || value === '') {
        return `${fieldName} is required`;
    }
    if (!validateCurrency(value)) {
        return `${fieldName} must be a valid positive number`;
    }
    return null;
};

// ============================================================================
// REQUIRED FIELD VALIDATION
// ============================================================================
export const validateRequired = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
};

export const getRequiredError = (value: any, fieldName: string): string | null => {
    if (!validateRequired(value)) return `${fieldName} is required`;
    return null;
};

// ============================================================================
// FORM VALIDATION HELPER
// ============================================================================
export interface ValidationRule<T = any> {
    field: keyof T;
    validator: (value: any) => string | null;
}

export const validateForm = <T extends Record<string, any>>(
    data: T,
    rules: ValidationRule<T>[]
): Record<string, string> => {
    const errors: Record<string, string> = {};

    for (const rule of rules) {
        const error = rule.validator(data[rule.field]);
        if (error) {
            errors[rule.field as string] = error;
        }
    }

    return errors;
};

export const hasErrors = (errors: Record<string, string>): boolean => {
    return Object.keys(errors).length > 0;
};
