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
    if (status === 'authenticated') {
      const currentUser = session?.user as { isRegistered?: boolean; teamId?: string | null } | undefined;
      if (!currentUser?.isRegistered) {
        if (currentUser?.teamId) {
          router.push('/login/verify');
          return;
        }
        router.push('/signup');
      }
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

