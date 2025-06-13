'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import CustomSplashScreen from '../components/CustomSplashScreen';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [animationCompleted, setAnimationCompleted] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') {
        setIsCheckingAuth(false);
        return;
      }

      const token = localStorage.getItem('authToken');
      const isAuthPage = pathname === '/';

      if (animationCompleted) {
        if (token && isAuthPage) {
          router.replace('/pages/dashboard');
          return;
        }

        if (!token && !isAuthPage) {
          router.replace('/');
          return;
        }

        setIsCheckingAuth(false);
      }
    };

    checkAuth();
    const timeout = setTimeout(checkAuth, 100);

    return () => clearTimeout(timeout);
  }, [pathname, router, animationCompleted]);

  if (isCheckingAuth) {
    return <CustomSplashScreen onAnimationComplete={() => setAnimationCompleted(true)} />;
  }

  return <>{children}</>;
};