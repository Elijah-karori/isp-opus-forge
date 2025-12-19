import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { X } from 'lucide-react';

interface QuickStartStepProps {
  onComplete: () => void;
  onBack?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  onSkip?: () => void;
}

interface QuickStartStep {
  id: string;
  title: string;
  component: React.ComponentType<QuickStartStepProps>;
  required?: boolean;
}

// Step Components
const WelcomeStep: React.FC<QuickStartStepProps> = ({ onComplete, isLastStep }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium">Welcome to ISP Opus Forge</h3>
    <p className="text-muted-foreground">
      Let's get you started with the basics of our platform.
    </p>
    <div className="space-y-2 text-sm">
      <p>• Learn how to navigate the dashboard</p>
      <p>• Set up your profile and preferences</p>
      <p>• Get familiar with key features</p>
    </div>
    <div className="flex justify-end">
      <Button onClick={onComplete}>
        {isLastStep ? 'Get Started' : 'Next'}
      </Button>
    </div>
  </div>
);

const ProfileStep: React.FC<QuickStartStepProps> = ({ onComplete, onBack, isFirstStep, isLastStep }) => {
  const [name, setName] = useLocalStorage('user-name', '');
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Set Up Your Profile</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>
        {/* Add more profile fields as needed */}
      </div>
      <div className="flex justify-between pt-4">
        {!isFirstStep && (
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button 
          onClick={onComplete}
          disabled={!name.trim()}
          className="ml-auto"
        >
          {isLastStep ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

const PreferencesStep: React.FC<QuickStartStepProps> = ({ onComplete, onBack, isFirstStep, isLastStep }) => {
  const [darkMode, setDarkMode] = useLocalStorage('dark-mode', false);
  const [notifications, setNotifications] = useLocalStorage('notifications', true);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Configure Preferences</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Dark Mode</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={darkMode} 
              onChange={(e) => setDarkMode(e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
        <div className="flex items-center justify-between">
          <span>Email Notifications</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={notifications} 
              onChange={(e) => setNotifications(e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
      <div className="flex justify-between pt-4">
        {!isFirstStep && (
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button onClick={onComplete} className="ml-auto">
          {isLastStep ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

const CompleteStep: React.FC<QuickStartStepProps> = ({ onComplete }) => (
  <div className="text-center space-y-6">
    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
      <svg
        className="h-10 w-10 text-green-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium">You're all set!</h3>
    <p className="text-muted-foreground">
      You've completed the quick start guide. Start exploring the platform!
    </p>
    <Button onClick={onComplete} className="mt-4">
      Go to Dashboard
    </Button>
  </div>
);

const QuickStartGuide: React.FC = () => {
  const [currentStep, setCurrentStep] = useLocalStorage('quickstart-step', 0);
  const [completedSteps, setCompletedSteps] = useLocalStorage<string[]>('completed-steps', []);
  const [isOpen, setIsOpen] = useState(true);

  const steps: QuickStartStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to ISP Opus Forge',
      component: WelcomeStep,
      required: true
    },
    {
      id: 'profile',
      title: 'Set Up Your Profile',
      component: ProfileStep,
      required: true
    },
    {
      id: 'preferences',
      title: 'Configure Preferences',
      component: PreferencesStep
    },
    {
      id: 'complete',
      title: "You're All Set!",
      component: CompleteStep
    }
  ];

  const currentStepData = steps[currentStep];
  const StepComponent = currentStepData.component;
  const progress = Math.round((currentStep / (steps.length - 1)) * 100);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark all steps as completed when finishing the guide
      const allStepIds = steps.map(step => step.id);
      setCompletedSteps([...new Set([...completedSteps, ...allStepIds])]);
      setIsOpen(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteStep = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    handleNext();
  };

  const handleSkip = () => {
    // Mark all non-required steps as completed
    const nonRequiredStepIds = steps
      .filter(step => !step.required)
      .map(step => step.id);
    
    setCompletedSteps(prev => [...new Set([...prev, ...nonRequiredStepIds])]);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl relative">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{currentStepData.title}</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent>
          <StepComponent
            onComplete={() => handleCompleteStep(currentStepData.id)}
            onBack={handleBack}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === steps.length - 1}
            onSkip={handleSkip}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStartGuide;
