// Onboarding Wizard Component with Smooth Transitions
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
    Loader2, 
    CheckCircle2, 
    Circle, 
    Sparkles,
    User,
    Navigation,
    Star,
    Rocket
} from 'lucide-react';

const stepIcons: Record<string, React.ReactNode> = {
    'Welcome': <Sparkles className="h-8 w-8" />,
    'Profile Setup': <User className="h-8 w-8" />,
    'Navigation': <Navigation className="h-8 w-8" />,
    'Key Features': <Star className="h-8 w-8" />,
    'Get Started': <Rocket className="h-8 w-8" />,
};

export const OnboardingWizard: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
    const { isAuthenticated, user } = useAuth();
    const { status, loading, completeStep, skipOnboarding, startOnboarding } = useOnboarding();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [direction, setDirection] = useState<'next' | 'prev'>('next');

    useEffect(() => {
        if (status && !status.onboarding_completed && !status.onboarding_started_at) {
            startOnboarding();
        }
    }, [status]);

    if (!isAuthenticated) return null;

    if (loading) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading onboarding...</p>
                </div>
            </div>
        );
    }

    if (!status || status.onboarding_completed) {
        return null;
    }

    const currentStep = status.steps[currentStepIndex];
    const progress = ((currentStepIndex + 1) / status.total_steps) * 100;

    const handleNext = async () => {
        if (!currentStep) return;

        setIsTransitioning(true);
        setDirection('next');
        
        await completeStep(currentStep.id);

        setTimeout(() => {
            if (currentStepIndex < status.steps.length - 1) {
                setCurrentStepIndex(currentStepIndex + 1);
            } else {
                onComplete?.();
            }
            setIsTransitioning(false);
        }, 300);
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setIsTransitioning(true);
            setDirection('prev');
            setTimeout(() => {
                setCurrentStepIndex(currentStepIndex - 1);
                setIsTransitioning(false);
            }, 300);
        }
    };

    const handleSkip = async () => {
        await skipOnboarding();
        onComplete?.();
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div 
                className={`
                    w-full max-w-2xl transform transition-all duration-300 ease-out
                    ${isTransitioning 
                        ? direction === 'next' 
                            ? 'opacity-0 translate-x-8' 
                            : 'opacity-0 -translate-x-8'
                        : 'opacity-100 translate-x-0'
                    }
                `}
            >
                <Card className="shadow-2xl border-0 bg-card">
                    <CardHeader className="space-y-4 pb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold">
                                    Welcome to ISP ERP
                                </CardTitle>
                                <CardDescription className="text-base mt-1">
                                    {user?.full_name ? `Hi ${user.full_name}!` : 'Hi there!'} Let's get you started.
                                </CardDescription>
                            </div>
                            <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                                Step {currentStepIndex + 1} of {status.total_steps}
                            </div>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Step Indicators */}
                        <div className="flex justify-between px-4">
                            {status.steps.map((step, index) => (
                                <div 
                                    key={step.id} 
                                    className={`
                                        flex flex-col items-center transition-all duration-300
                                        ${index === currentStepIndex ? 'scale-110' : 'scale-100'}
                                    `}
                                >
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center
                                        transition-all duration-300
                                        ${step.completed 
                                            ? 'bg-green-500 text-white' 
                                            : index === currentStepIndex 
                                                ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' 
                                                : 'bg-muted text-muted-foreground'
                                        }
                                    `}>
                                        {step.completed ? (
                                            <CheckCircle2 className="h-5 w-5" />
                                        ) : index === currentStepIndex ? (
                                            <span className="text-sm font-bold">{index + 1}</span>
                                        ) : (
                                            <Circle className="h-5 w-5" />
                                        )}
                                    </div>
                                    <span className={`
                                        text-xs mt-2 text-center max-w-[70px] font-medium
                                        transition-colors duration-300
                                        ${index === currentStepIndex 
                                            ? 'text-foreground' 
                                            : 'text-muted-foreground'
                                        }
                                    `}>
                                        {step.step_name}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Current Step Content */}
                        {currentStep && (
                            <div className="space-y-4 pt-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-xl bg-primary/10 text-primary">
                                        {stepIcons[currentStep.step_name] || <Circle className="h-8 w-8" />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">{currentStep.step_name}</h3>
                                        <p className="text-muted-foreground">{currentStep.step_description}</p>
                                    </div>
                                </div>

                                {/* Step-specific content */}
                                <div className="p-6 border rounded-xl bg-muted/30">
                                    {currentStep.step_name === 'Welcome' && (
                                        <div className="space-y-3">
                                            <p className="text-sm text-muted-foreground">
                                                This ERP system helps you manage:
                                            </p>
                                            <ul className="space-y-2 text-sm">
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    Projects and task management
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    Finance and invoicing
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    HR and employee management
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    Inventory and procurement
                                                </li>
                                            </ul>
                                        </div>
                                    )}

                                    {currentStep.step_name === 'Profile Setup' && (
                                        <div className="space-y-3">
                                            <p className="text-sm text-muted-foreground">
                                                Your current profile information:
                                            </p>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Name:</span>
                                                    <p className="font-medium">{user?.full_name || 'Not set'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Email:</span>
                                                    <p className="font-medium">{user?.email || 'Not set'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Role:</span>
                                                    <p className="font-medium capitalize">{user?.role || 'User'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep.step_name === 'Navigation' && (
                                        <div className="space-y-3">
                                            <p className="text-sm text-muted-foreground">
                                                Navigation tips:
                                            </p>
                                            <ul className="space-y-2 text-sm">
                                                <li className="flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs font-bold">1</span>
                                                    Use the sidebar to navigate between modules
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs font-bold">2</span>
                                                    Dashboard shows your key metrics at a glance
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs font-bold">3</span>
                                                    Click on items to view details and take actions
                                                </li>
                                            </ul>
                                        </div>
                                    )}

                                    {currentStep.step_name === 'Key Features' && (
                                        <div className="space-y-3">
                                            <p className="text-sm text-muted-foreground">
                                                Based on your role as <strong className="capitalize">{user?.role || 'user'}</strong>, you have access to:
                                            </p>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                {user?.menus?.slice(0, 6).map((menu, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 p-2 rounded bg-background">
                                                        <Star className="h-4 w-4 text-yellow-500" />
                                                        {menu.label}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {currentStep.step_name === 'Get Started' && (
                                        <div className="text-center space-y-4">
                                            <Rocket className="h-16 w-16 mx-auto text-primary" />
                                            <p className="text-sm text-muted-foreground">
                                                You're all set! Click "Finish" to start using the ERP system.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex justify-between pt-6 border-t">
                        <Button variant="ghost" onClick={handleSkip}>
                            Skip for Now
                        </Button>
                        <div className="flex gap-2">
                            {currentStepIndex > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={handlePrev}
                                    disabled={isTransitioning}
                                >
                                    Previous
                                </Button>
                            )}
                            <Button 
                                onClick={handleNext}
                                disabled={isTransitioning}
                                className="min-w-[100px]"
                            >
                                {isTransitioning ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : currentStepIndex === status.steps.length - 1 ? (
                                    'Finish'
                                ) : (
                                    'Next'
                                )}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};