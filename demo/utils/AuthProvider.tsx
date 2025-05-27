'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const isAuthPage = pathname === '/';
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      if (!token && !isAuthPage) {
        router.replace('/');
      } else if (token && isAuthPage) {
        router.replace('/pages/dashboard');
      }
    };

    checkAuth();
  }, [pathname, router]);

  return <>{children}</>;
};