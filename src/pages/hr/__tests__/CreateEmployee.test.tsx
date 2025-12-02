import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateEmployeePage from '../CreateEmployee';
import { MemoryRouter } from 'react-router-dom';
import { apiClient } from '@/lib/api';

// Mock dependencies
const mockNavigate = vi.fn();
const mockToast = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: mockToast,
    }),
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('@/lib/api', () => ({
    apiClient: {
        getUsers: vi.fn(),
        createEmployee: vi.fn(),
    },
}));

// Mock Radix UI Select
vi.mock('@/components/ui/select', () => ({
    Select: ({ onValueChange, children, value }: any) => {
        return (
            <select
                data-testid="mock-select"
                value={value || ''}
                onChange={(e) => onValueChange?.(e.target.value)}
            >
                <option value="">Select...</option>
                {children}
            </select>
        );
    },
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ value, children }: any) => (
        <option value={value}>{children}</option>
    ),
}));

describe('CreateEmployeePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (apiClient.getUsers as any).mockResolvedValue({
            users: [
                { id: 1, full_name: 'John Doe', email: 'john@example.com' },
                { id: 2, full_name: 'Jane Smith', email: 'jane@example.com' },
            ]
        });
    });

    it('renders create employee form correctly', async () => {
        render(
            <MemoryRouter>
                <CreateEmployeePage />
            </MemoryRouter>
        );

        expect(screen.getByText('Create New Employee Profile')).toBeInTheDocument();
        await waitFor(() => {
            expect(apiClient.getUsers).toHaveBeenCalled();
        });
    });

    it('validates required fields', async () => {
        render(
            <MemoryRouter>
                <CreateEmployeePage />
            </MemoryRouter>
        );

        // Wait for component to load
        await waitFor(() => {
            expect(apiClient.getUsers).toHaveBeenCalled();
        });

        // Get the form and submit it directly
        const submitBtn = screen.getByRole('button', { name: /create employee/i });
        const form = submitBtn.closest('form');

        if (form) {
            fireEvent.submit(form);
        }

        // The validation should show a toast
        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
                title: "Missing Required Fields",
                variant: "destructive"
            }));
        }, { timeout: 2000 });
    });

    it('submits form with valid data', async () => {
        (apiClient.createEmployee as any).mockResolvedValue({});

        render(
            <MemoryRouter>
                <CreateEmployeePage />
            </MemoryRouter>
        );

        // Wait for data load
        await waitFor(() => expect(apiClient.getUsers).toHaveBeenCalled());

        // Fill form - get all sel ects
        const selects = screen.getAllByTestId('mock-select');

        // User Select
        fireEvent.change(selects[0], { target: { value: '1' } });

        // Role Select
        fireEvent.change(selects[1], { target: { value: '4' } });

        // Hire Date
        const hireDateInput = screen.getByLabelText(/hire date/i);
        fireEvent.change(hireDateInput, { target: { value: '2023-01-01' } });

        // Engagement Type Select
        fireEvent.change(selects[2], { target: { value: 'FULL_TIME' } });

        // Submit
        const submitBtn = screen.getByRole('button', { name: /create employee/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(apiClient.createEmployee).toHaveBeenCalledWith(expect.objectContaining({
                user_id: 1,
                role_id: 4,
                hire_date: '2023-01-01',
                engagement_type: 'FULL_TIME'
            }));
            expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
                title: "Employee Created"
            }));
            expect(mockNavigate).toHaveBeenCalledWith('/hr');
        });
    });
});
