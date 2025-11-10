'use client';

import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initialize();
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, initialize, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin border-2 border-gray-200 border-t-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}

