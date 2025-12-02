import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingWizard } from '../OnboardingWizard';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/hooks/useOnboarding';

// Mock hooks
vi.mock('@/contexts/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('@/hooks/useOnboarding', () => ({
    useOnboarding: vi.fn(),
}));

describe('OnboardingWizard', () => {
    const mockCompleteStep = vi.fn();
    const mockSkipOnboarding = vi.fn();
    const mockStartOnboarding = vi.fn();
    const mockOnComplete = vi.fn();

    const mockStatus = {
        onboarding_completed: false,
        onboarding_step: 'Welcome',
        onboarding_started_at: '2025-01-01T00:00:00Z',
        onboarding_completed_at: null,
        current_step_index: 0,
        total_steps: 2,
        steps: [
            {
                id: 1,
                step_order: 1,
                step_name: 'Welcome Step',
                step_description: 'Description 1',
                required: true,
                completed: false,
            },
            {
                id: 2,
                step_order: 2,
                step_name: 'Second Step',
                step_description: 'Description 2',
                required: true,
                completed: false,
            },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({ isAuthenticated: true });
        (useOnboarding as any).mockReturnValue({
            status: mockStatus,
            loading: false,
            completeStep: mockCompleteStep,
            skipOnboarding: mockSkipOnboarding,
            startOnboarding: mockStartOnboarding,
        });
    });

    it('renders nothing if not authenticated', () => {
        (useAuth as any).mockReturnValue({ isAuthenticated: false });
        render(<OnboardingWizard />);
        expect(screen.queryByText('Welcome to the ERP System')).not.toBeInTheDocument();
    });

    it('renders loading state', () => {
        (useOnboarding as any).mockReturnValue({
            loading: true,
            status: null,
        });
        render(<OnboardingWizard />);
        // Assuming Loader2 renders an SVG or we can find it by some means. 
        // Since we can't easily query the icon, we verify the main content is missing.
        expect(screen.queryByText('Welcome to the ERP System')).not.toBeInTheDocument();
    });

    it('renders wizard content when loaded and authenticated', () => {
        render(<OnboardingWizard />);
        expect(screen.getByText('Welcome to the ERP System')).toBeInTheDocument();
        const welcomeSteps = screen.getAllByText('Welcome Step');
        expect(welcomeSteps.length).toBeGreaterThan(0);
        expect(screen.getByText('Step 1 of 2')).toBeInTheDocument();
    });

    it('calls startOnboarding if not started', () => {
        const statusNotStarted = { ...mockStatus, onboarding_started_at: null };
        (useOnboarding as any).mockReturnValue({
            status: statusNotStarted,
            loading: false,
            completeStep: mockCompleteStep,
            skipOnboarding: mockSkipOnboarding,
            startOnboarding: mockStartOnboarding,
        });

        render(<OnboardingWizard />);
        expect(mockStartOnboarding).toHaveBeenCalled();
    });

    it('calls completeStep when Next is clicked', async () => {
        render(<OnboardingWizard />);
        const nextButton = screen.getByText('Next');
        fireEvent.click(nextButton);
        expect(mockCompleteStep).toHaveBeenCalledWith(1);
    });

    it('calls skipOnboarding when Skip is clicked', async () => {
        render(<OnboardingWizard onComplete={mockOnComplete} />);
        const skipButton = screen.getByText('Skip for Now');
        fireEvent.click(skipButton);
        expect(mockSkipOnboarding).toHaveBeenCalled();
        // Wait for async operations if necessary, but here mocks are sync-like unless delayed.
        // The component awaits skipOnboarding, then calls onComplete.
        await waitFor(() => expect(mockOnComplete).toHaveBeenCalled());
    });
});
