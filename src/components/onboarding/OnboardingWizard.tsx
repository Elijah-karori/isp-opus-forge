// Onboarding Wizard Component
import React, { useState } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

export const OnboardingWizard: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
    const { isAuthenticated } = useAuth();
    const { status, loading, error, completeStep, skipOnboarding, startOnboarding } = useOnboarding();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // Start onboarding if not already started
    React.useEffect(() => {
        if (status && !status.onboarding_completed && !status.onboarding_started_at) {
            startOnboarding();
        }
    }, [status, startOnboarding]);

    if (!isAuthenticated) return null;

    if (loading || (!status && !error)) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!status || status.onboarding_completed) {
        return null;
    }

    const currentStep = status.steps[currentStepIndex];
    const progress = ((currentStepIndex + 1) / status.total_steps) * 100;

    const handleNext = async () => {
        if (currentStep) {
            await completeStep(currentStep.id);
        }

        if (currentStepIndex < status.steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            onComplete?.();
        }
    };

    const handleSkip = async () => {
        await skipOnboarding();
        onComplete?.();
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Welcome to the ERP System</CardTitle>
                    <CardDescription>
                        Step {currentStepIndex + 1} of {status.total_steps}
                    </CardDescription>
                    <Progress value={progress} className="mt-2" />
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Step Indicators */}
                    <div className="flex justify-between mb-6">
                        {status.steps.map((step, index) => (
                            <div key={step.id} className="flex flex-col items-center">
                                {step.completed ? (
                                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                                ) : index === currentStepIndex ? (
                                    <Circle className="h-6 w-6 text-primary fill-primary" />
                                ) : (
                                    <Circle className="h-6 w-6 text-muted-foreground" />
                                )}
                                <span className="text-xs mt-1 text-center max-w-[80px]">
                                    {step.step_name}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Current Step Content */}
                    {currentStep && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">{currentStep.step_name}</h3>
                            <p className="text-muted-foreground">{currentStep.step_description}</p>

                            {/* Step-specific content would go here */}
                            <div className="p-4 border rounded-lg bg-muted/50">
                                <p className="text-sm">
                                    Complete this step to continue with your onboarding process.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleSkip}>
                        Skip for Now
                    </Button>
                    <div className="flex gap-2">
                        {currentStepIndex > 0 && (
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                            >
                                Previous
                            </Button>
                        )}
                        <Button onClick={handleNext}>
                            {currentStepIndex === status.steps.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};
