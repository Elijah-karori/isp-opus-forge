// Onboarding API Service
import { apiClient } from '@/lib/api';
import { OnboardingStatus, OnboardingStep } from '@/types/onboarding.types';

export const onboardingService = {
    async getStatus(): Promise<OnboardingStatus> {
        const response = await apiClient.get('/onboarding/status');
        return response.data;
    },

    async getSteps(): Promise<OnboardingStep[]> {
        const response = await apiClient.get('/onboarding/steps');
        return response.data;
    },

    async completeStep(stepId: number): Promise<void> {
        await apiClient.post('/onboarding/complete-step', { step_id: stepId });
    },

    async startOnboarding(): Promise<void> {
        await apiClient.post('/onboarding/start', {});
    },

    async skipOnboarding(): Promise<void> {
        await apiClient.post('/onboarding/skip', {});
    }
};
