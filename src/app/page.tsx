'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/storage';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-3xl">📊</span>
        </div>
        <p className="text-gray-600">Loading Life Tracker...</p>
      </div>
    </div>
  );
}
