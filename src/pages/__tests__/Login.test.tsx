import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '../Login';
import { MemoryRouter } from 'react-router-dom';

// Mock hooks
const mockLogin = vi.fn();
const mockNavigate = vi.fn();
const mockToast = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        login: mockLogin,
    }),
}));

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

describe('Login Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form correctly', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
        expect(screen.getByLabelText(/email or username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('handles user input correctly', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const usernameInput = screen.getByLabelText(/email or username/i);
        const passwordInput = screen.getByLabelText(/password/i);

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(usernameInput).toHaveValue('testuser');
        expect(passwordInput).toHaveValue('password123');
    });

    it('submits form with valid credentials', async () => {
        mockLogin.mockResolvedValueOnce({});

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/email or username/i), { target: { value: 'admin' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'admin123' } });

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('admin', 'admin123');
            expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
                title: "Login Successful"
            }));
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('displays error on login failure', async () => {
        mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/email or username/i), { target: { value: 'wrong' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalled();
            expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
                title: "Login Failed",
                variant: "destructive"
            }));
        });
    });
});
