// Custom Hook for Onboarding
import { useState, useEffect } from 'react';
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

    const loadStatus = async () => {
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
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadStatus();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const completeStep = async (stepId: number) => {
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
    };

    const startOnboarding = async () => {
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
    };

    const skipOnboarding = async () => {
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
    };

    return {
        status,
        loading,
        error,
        completeStep,
        startOnboarding,
        skipOnboarding,
        reload: loadStatus,
    };
};
