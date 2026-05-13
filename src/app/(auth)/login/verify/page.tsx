'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

export default function LoginVerifyPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [teamLoginId, setTeamLoginId] = useState('');
  const [teamPassword, setTeamPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedTeamLoginId = sessionStorage.getItem('login-teamLoginId') || '';
    const savedTeamPassword = sessionStorage.getItem('login-teamPassword') || '';
    setTeamLoginId(savedTeamLoginId);
    setTeamPassword(savedTeamPassword);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    if (status === 'authenticated') {
      const currentUser = session?.user as { isRegistered?: boolean; teamId?: string | null } | undefined;
      if (currentUser?.isRegistered) {
        router.replace('/prompts');
        return;
      }
      if (!currentUser?.teamId) {
        router.replace('/signup');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status !== 'authenticated') {
    return null;
  }

  const handleVerify = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamLoginId: teamLoginId.trim(), teamPassword: teamPassword.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Team認証に失敗しました');
      }

      sessionStorage.removeItem('login-teamLoginId');
      sessionStorage.removeItem('login-teamPassword');

      try {
        await update();
      } catch {
        router.refresh();
      }
      router.replace('/prompts');
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Team認証に失敗しました');
    } finally {
      setLoading(false);
    }
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
      <Card sx={{ maxWidth: 440, width: '100%', boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="column" sx={{ gap: 2, mb: 3 }}>
            <Typography variant="h5" component="h1" sx={{ textAlign: 'center' }}>
              Team認証
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Microsoft認証後にTeam ID/PWを確認します
            </Typography>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Team ID"
            fullWidth
            value={teamLoginId}
            onChange={(event) => setTeamLoginId(event.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Team Password"
            type="password"
            fullWidth
            value={teamPassword}
            onChange={(event) => setTeamPassword(event.target.value)}
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || !teamLoginId.trim() || !teamPassword.trim()}
            onClick={handleVerify}
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'ログインを完了'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

