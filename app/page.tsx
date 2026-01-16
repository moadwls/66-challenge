'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';

export default function HomePage() {
  const { data } = useApp();
  const router = useRouter();

  useEffect(() => {
    router.push('/today');
  }, [router]);

  return null;
}
