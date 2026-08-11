import { Navigate, Outlet } from 'react-router';
import { useProfile } from '@/db/useProfile';
import { SplashScreen } from '@/shared/ui/SplashScreen';

export function OnboardingGate() {
  const profile = useProfile();

  if (profile === undefined) return <SplashScreen />;
  if (!profile) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
}
