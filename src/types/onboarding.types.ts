// Onboarding TypeScript Types
export interface OnboardingStep {
    id: number;
    role_id?: number;
    step_order: number;
    step_name: string;
    step_description: string;
    step_type?: string;
    required: boolean;
    completed: boolean;
    completion_criteria?: string | null;
}

export interface OnboardingStatus {
    onboarding_completed: boolean;
    onboarding_step: string;
    onboarding_started_at: string | null;
    onboarding_completed_at: string | null;
    current_step_index: number;
    total_steps: number;
    steps: OnboardingStep[];
}

export interface OnboardingProgress {
    completedSteps: number;
    totalSteps: number;
    percentage: number;
}
