'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Button,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';

export default function LoginVerifyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    const teamId = sessionStorage.getItem('login-teamId');
    if (!teamId) {
      // No team ID stored — redirect to login with error
      router.push('/login?error=no-team');
      return;
    }

    // Verify team membership
    fetch('/api/auth/verify-team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          sessionStorage.removeItem('login-teamId');
          router.push('/prompts');
        } else {
          setError(data.error || 'Team IDの検証に失敗しました');
          setVerifying(false);
        }
      })
      .catch(() => {
        setError('通信エラーが発生しました');
        setVerifying(false);
      });
  }, [session, status, router]);

  const handleSignOutAndRetry = async () => {
    sessionStorage.removeItem('login-teamId');
    await signOut({ redirect: false });
    router.push('/login');
  };

  if (status === 'loading' || verifying) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          チーム情報を確認中...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Card sx={{ maxWidth: 440, width: '100%', boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="column" sx={{ alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ bgcolor: 'error.main', width: 48, height: 48 }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography variant="h5" component="h1">
              ログインエラー
            </Typography>
          </Stack>

          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            入力されたTeam IDがお使いのアカウントに紐付けられていません。正しいTeam IDで再度ログインしてください。
          </Typography>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSignOutAndRetry}
            sx={{ py: 1.5 }}
          >
            ログイン画面に戻る
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
