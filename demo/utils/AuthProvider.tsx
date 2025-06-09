'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import CustomSplashScreen from '../components/CustomSplashScreen';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthPage = pathname === '/';
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!token && !isAuthPage) {
        router.replace('/');
      } else if (token && isAuthPage) {
        router.replace('/pages/dashboard');
      }

      setIsCheckingAuth(false);
    };

    if (typeof window !== 'undefined') {
      checkAuth();
    }
  }, [pathname, router]);

  if (isCheckingAuth) {
    return <CustomSplashScreen />;
  }

  return <>{children}</>;
};