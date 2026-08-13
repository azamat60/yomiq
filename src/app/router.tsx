import { createBrowserRouter } from 'react-router';
import { AppLayout } from './AppLayout';
import { OnboardingGate } from './OnboardingGate';
import { DiaryPage } from '@/features/diary/DiaryPage';
import { FavoritesPage } from '@/features/favorites/FavoritesPage';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { OnboardingPage } from '@/features/onboarding/OnboardingPage';
import { lazyChunk } from '@/shared/lib/lazyChunk';

// The charts and block renderers are dead weight on the diary's first paint.
const CoachPage = lazyChunk(() =>
  import('@/features/coach/CoachPage').then((module) => ({ default: module.CoachPage })),
);

export const router = createBrowserRouter([
  {
    element: <OnboardingGate />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <DiaryPage /> },
          { path: '/coach', element: <CoachPage /> },
          { path: '/favorites', element: <FavoritesPage /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
  { path: '/onboarding', element: <OnboardingPage /> },
]);
