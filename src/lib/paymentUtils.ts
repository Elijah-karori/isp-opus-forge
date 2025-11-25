// Mock payment processing utilities

export interface StripePaymentResult {
    success: boolean;
    transactionId: string;
    message?: string;
}

export interface MPESAPaymentResult {
    success: boolean;
    transactionId: string;
    message?: string;
}

/**
 * Mock Stripe payment processing
 * Test card numbers:
 * - 4242424242424242 (Success)
 * - 4000000000000002 (Card declined)
 */
export const mockStripePayment = async (
    amount: number,
    cardNumber: string,
    cvv: string,
    expiryDate: string
): Promise<StripePaymentResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Validate card number format
    if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
        throw new Error('Invalid card number format');
    }

    // Mock card validation
    const cleanCardNumber = cardNumber.replace(/\s/g, '');

    if (cleanCardNumber === '4242424242424242') {
        return {
            success: true,
            transactionId: `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            message: 'Payment successful'
        };
    }

    if (cleanCardNumber === '4000000000000002') {
        throw new Error('Card declined - insufficient funds');
    }

    throw new Error('Invalid card number');
};

/**
 * Mock MPESA payment processing
 * Test phone numbers:
 * - 254712345678 (Success)
 * - 254700000000 (Insufficient balance)
 */
export const mockMPESAPayment = async (
    amount: number,
    phoneNumber: string
): Promise<MPESAPaymentResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Validate phone number format (Kenyan format)
    if (!/^254\d{9}$/.test(phoneNumber.replace(/\s/g, ''))) {
        throw new Error('Invalid phone number format. Use format: 254XXXXXXXXX');
    }

    const cleanPhone = phoneNumber.replace(/\s/g, '');

    if (cleanPhone === '254700000000') {
        throw new Error('Insufficient balance in MPESA account');
    }

    // All other valid numbers succeed
    return {
        success: true,
        transactionId: `mpesa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: 'Payment successful. You will receive an SMS confirmation.'
    };
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 2
    }).format(numAmount);
};

/**
 * Calculate invoice status based on payment and due date
 */
export const calculateInvoiceStatus = (invoice: {
    amount: string | number;
    amount_paid: string | number;
    due_date: string | null;
}): 'paid' | 'partial' | 'overdue' | 'pending' => {
    const amount = typeof invoice.amount === 'string' ? parseFloat(invoice.amount) : invoice.amount;
    const amountPaid = typeof invoice.amount_paid === 'string' ? parseFloat(invoice.amount_paid) : invoice.amount_paid;

    if (amountPaid >= amount) return 'paid';
    if (amountPaid > 0) return 'partial';
    if (invoice.due_date && new Date() > new Date(invoice.due_date)) return 'overdue';
    return 'pending';
};
