// Onboarding API Service
import { apiClient } from '@/lib/api';
import { OnboardingStatus, OnboardingStep } from '@/types/onboarding.types';

export const onboardingService = {
    async getStatus(): Promise<OnboardingStatus> {
        return apiClient.get<OnboardingStatus>('/onboarding/status');
    },

    async getSteps(): Promise<OnboardingStep[]> {
        return apiClient.get<OnboardingStep[]>('/onboarding/steps');
    },

    async completeStep(stepId: number): Promise<void> {
        await apiClient.post('/onboarding/complete-step', { step_id: stepId });
    },

    async startOnboarding(): Promise<void> {
        await apiClient.post('/onboarding/start', {});
    },

    async skipOnboarding(): Promise<void> {
        await apiClient.post('/onboarding/skip', {});
    },

    async resetOnboarding(): Promise<void> {
        await apiClient.post('/onboarding/reset', {});
    }
};