// Custom Hook for Onboarding
import { useState, useEffect, useCallback } from 'react';
import { onboardingService } from '@/services/onboarding.service';
import { OnboardingStatus } from '@/types/onboarding.types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useOnboarding = () => {
    const { isAuthenticated } = useAuth();
    const [status, setStatus] = useState<OnboardingStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const loadStatus = useCallback(async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const data = await onboardingService.getStatus();
            setStatus(data);
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || err.message || 'Failed to load onboarding status';
            setError(errorMessage);
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, toast]);

    useEffect(() => {
        if (isAuthenticated) {
            loadStatus();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, loadStatus]);

    const completeStep = useCallback(async (stepId: number) => {
        try {
            await onboardingService.completeStep(stepId);
            await loadStatus(); // Reload status
            toast({
                title: 'Step Completed',
                description: 'You have successfully completed this step.',
            });
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || err.message || 'Failed to complete step';
            setError(errorMessage);
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        }
    }, [loadStatus, toast]);

    const startOnboarding = useCallback(async () => {
        try {
            await onboardingService.startOnboarding();
            await loadStatus();
            toast({
                title: 'Onboarding Started',
                description: 'Welcome! Let\'s get you set up.',
            });
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || err.message || 'Failed to start onboarding';
            setError(errorMessage);
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        }
    }, [loadStatus, toast]);

    const skipOnboarding = useCallback(async () => {
        try {
            await onboardingService.skipOnboarding();
            await loadStatus();
            toast({
                title: 'Onboarding Skipped',
                description: 'You can access onboarding later from your profile.',
            });
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || err.message || 'Failed to skip onboarding';
            setError(errorMessage);
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        }
    }, [loadStatus, toast]);

    const resetOnboarding = useCallback(async () => {
        try {
            await onboardingService.resetOnboarding();
            await loadStatus();
            toast({
                title: 'Onboarding Reset',
                description: 'Your onboarding progress has been reset.',
            });
            // Optional: Reload page to force wizard to appear if it doesn't automatically
            window.location.reload();
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || err.message || 'Failed to reset onboarding';
            setError(errorMessage);
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        }
    }, [loadStatus, toast]);

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
