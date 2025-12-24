import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

export const Layout = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user needs onboarding (demo mode - check localStorage)
  useEffect(() => {
    if (isAuthenticated && user) {
      const onboardingKey = `onboarding_completed_${user.id}`;
      const completed = localStorage.getItem(onboardingKey);
      if (!completed) {
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated, user]);

  const handleOnboardingComplete = () => {
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }
    setShowOnboarding(false);
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
        <AppSidebar />

        <div className="flex flex-1 flex-col relative">
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-white/10 bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl px-6">
            <SidebarTrigger className="text-slate-600 dark:text-slate-400 hover:bg-white/20">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>

            <div className="flex-1" />

            <div className="flex items-center gap-6">
              <NotificationDropdown />
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{user?.full_name}</span>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  {user?.roles_v2?.[0]?.name || 'Member'}
                </span>
              </div>
              <Button onClick={logout} variant="ghost" size="sm" className="h-10 w-10 sm:w-auto rounded-xl hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/20 text-slate-600 dark:text-slate-400">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline font-bold">Logout</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 lg:p-10">
            <div className="relative">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Onboarding Wizard */}
      {showOnboarding && (
        <OnboardingWizard onComplete={handleOnboardingComplete} />
      )}
    </SidebarProvider>
  );
};
