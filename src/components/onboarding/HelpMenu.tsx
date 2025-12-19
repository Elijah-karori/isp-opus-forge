import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export const HelpMenu = () => {
  const [, setStep] = useLocalStorage('quickstart-step', 0);
  const [, setCompletedSteps] = useLocalStorage<string[]>('completed-steps', []);

  const restartGuide = () => {
    setStep(0);
    setCompletedSteps([]);
    // Optional: You can add a small delay to ensure state updates before showing the guide
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Help</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={restartGuide}>
          <span>Show Quick Start Guide</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a 
            href="/docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full h-full"
          >
            Documentation
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a 
            href="mailto:support@ispopusforge.com"
            className="w-full h-full"
          >
            Contact Support
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HelpMenu;
