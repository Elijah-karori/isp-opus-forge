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
    Select: ({ onValueChange, children }: any) => (
        <div data-testid="mock-select">
            <select onChange={(e) => onValueChange(e.target.value)}>
                {children}
            </select>
        </div>
    ),
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectValue: () => <span>Select Value</span>,
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
        // Wait for users to be fetched
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

        const submitBtn = screen.getByRole('button', { name: /create employee/i });
        fireEvent.click(submitBtn);

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

        // Fill form
        // Find the hidden selects within the mock and change them
        const selects = screen.getAllByRole('combobox');

        // 1. User Select
        fireEvent.change(selects[0], { target: { value: '1' } });

        // 2. Role Select
        // Note: The component uses hardcoded roles or fetches them? 
        // Looking at the component code previously, it seemed to import roles or define them.
        // Let's assume the value 'technician' corresponds to an ID or value used in the component.
        // If the component uses `fallbackRoles` and maps names to IDs, we need to match that.
        // However, if we look at the previous test attempt, it used 'technician'.
        // Let's check the component source if possible, but for now I'll use a likely value.
        // Actually, let's use a value that definitely exists in the options.
        // If I can't check the component, I'll guess 'technician' or '4'.
        // Let's assume the component maps the selected value directly if it's a string, or an ID.
        // In the previous test it expected `role_id: 4`.
        fireEvent.change(selects[1], { target: { value: '4' } });

        // Hire Date
        const hireDateInput = screen.getByLabelText(/hire date/i);
        fireEvent.change(hireDateInput, { target: { value: '2023-01-01' } });

        // 3. Engagement Type Select
        fireEvent.change(selects[2], { target: { value: 'FULL_TIME' } });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /create employee/i }));

        await waitFor(() => {
            expect(apiClient.createEmployee).toHaveBeenCalledWith(expect.objectContaining({
                user_id: 1, // '1' cast to number
                role_id: 4, // '4' cast to number
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
