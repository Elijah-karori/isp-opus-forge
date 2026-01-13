/**
 * Input validation schemas and utilities for security.
 * 
 * SECURITY NOTE: Client-side validation is for UX only.
 * Server-side validation is REQUIRED for actual security.
 */

import { z } from 'zod';

// ============================================================================
// Common validation patterns
// ============================================================================

const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;
const MAX_NAME_LENGTH = 100;
const MAX_OTP_LENGTH = 6;
const MAX_COMPANY_LENGTH = 100;
const MAX_PHONE_LENGTH = 20;
const MAX_TOKEN_LENGTH = 512;

// Regex patterns for validation
const SAFE_TEXT_PATTERN = /^[a-zA-Z0-9\s\-_.@]+$/;
const OTP_PATTERN = /^[0-9]{6}$/;
const PHONE_PATTERN = /^[+]?[0-9\s\-().]+$/;

// ============================================================================
// Authentication Schemas
// ============================================================================

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Username is required')
    .max(MAX_EMAIL_LENGTH, `Username must be less than ${MAX_EMAIL_LENGTH} characters`)
    .refine(
      (val) => !val.includes('<') && !val.includes('>'),
      'Invalid characters in username'
    ),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(MAX_PASSWORD_LENGTH, `Password must be less than ${MAX_PASSWORD_LENGTH} characters`),
  role: z.string().optional(),
});

export const emailSchema = z
  .string()
  .trim()
  .email('Invalid email address')
  .max(MAX_EMAIL_LENGTH, `Email must be less than ${MAX_EMAIL_LENGTH} characters`)
  .transform((val) => val.toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(MAX_PASSWORD_LENGTH, `Password must be less than ${MAX_PASSWORD_LENGTH} characters`)
  .refine(
    (val) => /[A-Z]/.test(val) || /[a-z]/.test(val),
    'Password must contain at least one letter'
  );

export const strongPasswordSchema = passwordSchema
  .refine((val) => /[A-Z]/.test(val), 'Password must contain at least one uppercase letter')
  .refine((val) => /[a-z]/.test(val), 'Password must contain at least one lowercase letter')
  .refine((val) => /[0-9]/.test(val), 'Password must contain at least one number');

export const otpSchema = z
  .string()
  .length(MAX_OTP_LENGTH, 'OTP must be 6 digits')
  .regex(OTP_PATTERN, 'OTP must contain only numbers');

export const tokenSchema = z
  .string()
  .min(1, 'Token is required')
  .max(MAX_TOKEN_LENGTH, 'Invalid token');

// ============================================================================
// Registration Schema
// ============================================================================

export const registrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(MAX_NAME_LENGTH, `Full name must be less than ${MAX_NAME_LENGTH} characters`)
    .refine(
      (val) => !val.includes('<') && !val.includes('>'),
      'Invalid characters in name'
    ),
  company_name: z
    .string()
    .max(MAX_COMPANY_LENGTH, `Company name must be less than ${MAX_COMPANY_LENGTH} characters`)
    .refine(
      (val) => !val || (!val.includes('<') && !val.includes('>')),
      'Invalid characters in company name'
    )
    .optional(),
});

// ============================================================================
// Profile Schema
// ============================================================================

export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(MAX_NAME_LENGTH, `Full name must be less than ${MAX_NAME_LENGTH} characters`)
    .refine(
      (val) => !val.includes('<') && !val.includes('>'),
      'Invalid characters in name'
    )
    .optional(),
  phone: z
    .string()
    .max(MAX_PHONE_LENGTH, `Phone must be less than ${MAX_PHONE_LENGTH} characters`)
    .refine(
      (val) => !val || PHONE_PATTERN.test(val),
      'Invalid phone number format'
    )
    .optional(),
  position: z
    .string()
    .max(MAX_NAME_LENGTH, `Position must be less than ${MAX_NAME_LENGTH} characters`)
    .refine(
      (val) => !val || (!val.includes('<') && !val.includes('>')),
      'Invalid characters in position'
    )
    .optional(),
});

// ============================================================================
// Password Reset Schema
// ============================================================================

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: tokenSchema,
  new_password: passwordSchema,
  confirm_password: z.string(),
}).refine(
  (data) => data.new_password === data.confirm_password,
  {
    message: "Passwords don't match",
    path: ['confirm_password'],
  }
);

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Sanitize a string by removing potentially dangerous characters
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate and sanitize email for display
 */
export function sanitizeEmail(email: string): string {
  const result = emailSchema.safeParse(email);
  return result.success ? result.data : '';
}

/**
 * Check if a value contains potential injection patterns
 */
export function hasSuspiciousPatterns(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /['"].*['"]/,
    /--/,
    /;.*drop/i,
    /;.*delete/i,
    /;.*update/i,
    /;.*insert/i,
    /union.*select/i,
  ];
  
  return suspiciousPatterns.some((pattern) => pattern.test(value));
}

/**
 * Safe error message extraction - never expose raw backend errors
 */
export function getSafeErrorMessage(error: unknown, fallback: string = 'An error occurred'): string {
  // Common safe error messages to pass through
  const safeMessages = [
    'Invalid credentials',
    'Invalid email address',
    'Invalid password',
    'Email already exists',
    'User not found',
    'Invalid or expired token',
    'Invalid or expired OTP',
    'Too many attempts',
    'Account locked',
    'Account not verified',
    'Password too weak',
    'Email is required',
    'Password is required',
  ];
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    // Only pass through known safe messages
    for (const safe of safeMessages) {
      if (message.includes(safe.toLowerCase())) {
        return safe;
      }
    }
  }
  
  return fallback;
}

// ============================================================================
// Type Exports
// ============================================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
