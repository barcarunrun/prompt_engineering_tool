'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    // ログイン済みだが未登録 → サインアップ完了ページへ
    if (status === 'authenticated' && !(session?.user as { isRegistered?: boolean })?.isRegistered) {
      router.push('/signup/complete');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (status !== 'authenticated') {
    return null;
  }

  if (!(session?.user as { isRegistered?: boolean })?.isRegistered) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

