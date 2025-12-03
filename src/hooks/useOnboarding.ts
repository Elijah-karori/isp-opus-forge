// Custom Hook for Onboarding (Demo Mode)
import { useState, useEffect, useCallback } from 'react';
import { OnboardingStatus, OnboardingStep } from '@/types/onboarding.types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Demo onboarding steps
const DEMO_STEPS: OnboardingStep[] = [
    {
        id: 1,
        step_order: 1,
        step_name: 'Welcome',
        step_description: 'Welcome to ISP ERP! This quick tour will help you get started with the system.',
        step_type: 'info',
        required: true,
        completed: false,
    },
    {
        id: 2,
        step_order: 2,
        step_name: 'Profile Setup',
        step_description: 'Complete your profile information to personalize your experience.',
        step_type: 'action',
        required: true,
        completed: false,
    },
    {
        id: 3,
        step_order: 3,
        step_name: 'Navigation',
        step_description: 'Learn how to navigate the dashboard and access different modules.',
        step_type: 'tutorial',
        required: true,
        completed: false,
    },
    {
        id: 4,
        step_order: 4,
        step_name: 'Key Features',
        step_description: 'Discover the main features available based on your role.',
        step_type: 'tutorial',
        required: false,
        completed: false,
    },
    {
        id: 5,
        step_order: 5,
        step_name: 'Get Started',
        step_description: "You're all set! Start using the ERP system to manage your workflows.",
        step_type: 'completion',
        required: true,
        completed: false,
    },
];

export const useOnboarding = () => {
    const { isAuthenticated, user } = useAuth();
    const [status, setStatus] = useState<OnboardingStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const getStorageKey = useCallback(() => {
        return user ? `onboarding_status_${user.id}` : null;
    }, [user]);

    const loadStatus = useCallback(async () => {
        if (!isAuthenticated || !user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Demo mode: Load from localStorage
            const storageKey = getStorageKey();
            if (storageKey) {
                const saved = localStorage.getItem(storageKey);
                if (saved) {
                    setStatus(JSON.parse(saved));
                } else {
                    // Initialize with demo steps
                    const initialStatus: OnboardingStatus = {
                        onboarding_completed: false,
                        onboarding_step: 'Welcome',
                        onboarding_started_at: null,
                        onboarding_completed_at: null,
                        current_step_index: 0,
                        total_steps: DEMO_STEPS.length,
                        steps: [...DEMO_STEPS],
                    };
                    setStatus(initialStatus);
                }
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to load onboarding status';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user, getStorageKey]);

    useEffect(() => {
        if (isAuthenticated) {
            loadStatus();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, loadStatus]);

    const saveStatus = useCallback((newStatus: OnboardingStatus) => {
        const storageKey = getStorageKey();
        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(newStatus));
        }
        setStatus(newStatus);
    }, [getStorageKey]);

    const completeStep = async (stepId: number) => {
        if (!status) return;

        try {
            const updatedSteps = status.steps.map(step =>
                step.id === stepId ? { ...step, completed: true } : step
            );

            const completedCount = updatedSteps.filter(s => s.completed).length;
            const allCompleted = completedCount === updatedSteps.length;

            const newStatus: OnboardingStatus = {
                ...status,
                steps: updatedSteps,
                onboarding_completed: allCompleted,
                onboarding_completed_at: allCompleted ? new Date().toISOString() : null,
            };

            saveStatus(newStatus);

            toast({
                title: 'Step Completed',
                description: 'You have successfully completed this step.',
            });
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to complete step';
            setError(errorMessage);
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        }
    };

    const startOnboarding = async () => {
        if (!status) return;

        try {
            const newStatus: OnboardingStatus = {
                ...status,
                onboarding_started_at: new Date().toISOString(),
            };

            saveStatus(newStatus);

            toast({
                title: 'Onboarding Started',
                description: "Welcome! Let's get you set up.",
            });
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to start onboarding';
            setError(errorMessage);
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        }
    };

    const skipOnboarding = async () => {
        if (!status) return;

        try {
            const newStatus: OnboardingStatus = {
                ...status,
                onboarding_completed: true,
                onboarding_completed_at: new Date().toISOString(),
            };

            saveStatus(newStatus);

            // Also mark in the layout's storage key
            if (user) {
                localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
            }

            toast({
                title: 'Onboarding Skipped',
                description: 'You can access onboarding later from your profile.',
            });
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to skip onboarding';
            setError(errorMessage);
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        }
    };

    const resetOnboarding = () => {
        const storageKey = getStorageKey();
        if (storageKey) {
            localStorage.removeItem(storageKey);
        }
        if (user) {
            localStorage.removeItem(`onboarding_completed_${user.id}`);
        }
        loadStatus();
    };

    return {
        status,
        loading,
        error,
        completeStep,
        startOnboarding,
        skipOnboarding,
        resetOnboarding,
        reload: loadStatus,
    };
};
