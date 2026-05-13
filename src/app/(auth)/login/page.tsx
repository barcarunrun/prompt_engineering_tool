'use client';

import React, { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Stack,
  CircularProgress,
  TextField,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [teamLoginId, setTeamLoginId] = useState('');
  const [teamPassword, setTeamPassword] = useState('');

  React.useEffect(() => {
    if (status === 'authenticated') {
      const currentUser = session?.user as { isRegistered?: boolean; teamId?: string | null } | undefined;
      if (currentUser?.isRegistered) {
        router.push('/prompts');
        return;
      }
      if (currentUser?.teamId) {
        router.push('/login/verify');
        return;
      }
      router.push('/signup');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const handleLogin = () => {
    sessionStorage.setItem('login-teamLoginId', teamLoginId.trim());
    sessionStorage.setItem('login-teamPassword', teamPassword.trim());
    signIn('microsoft-entra-id', { redirectTo: '/login/verify' });
  };

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
      <Card
        sx={{
          maxWidth: 440,
          width: '100%',
          boxShadow: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack direction="column" sx={{ alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography variant="h5" component="h1">
              Prompt Engineering Tool
            </Typography>
            <Typography variant="body2" color="text.secondary">
              チームのプロンプト管理を効率化
            </Typography>
          </Stack>

          <TextField
            label="Team ID"
            fullWidth
            value={teamLoginId}
            onChange={(e) => setTeamLoginId(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="チームIDを入力"
          />
          <TextField
            label="Team Password"
            type="password"
            fullWidth
            value={teamPassword}
            onChange={(e) => setTeamPassword(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="チームパスワードを入力"
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleLogin}
            disabled={!teamLoginId.trim() || !teamPassword.trim()}
            sx={{ mt: 1, py: 1.5 }}
          >
            Microsoft アカウントでログイン
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}
          >
            認証手順がわからない場合は{' '}
            <Link href="/how-to-auth" style={{ color: '#1976d2', textDecoration: 'none' }}>
              認証の使い方
            </Link>
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 2 }}
          >
            アカウントをお持ちでないですか？{' '}
            <a href="/signup" style={{ color: '#1976d2', textDecoration: 'none' }}>
              サインアップ
            </a>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

