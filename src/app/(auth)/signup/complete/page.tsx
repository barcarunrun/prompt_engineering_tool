'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';

export default function SignUpCompletePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  if (!session) {
    router.push('/login');
    return null;
  }

  const handleComplete = async () => {
    setLoading(true);
    setError('');
    try {
      const teamId = sessionStorage.getItem('signup-teamId') || '';
      const teamPassword = sessionStorage.getItem('signup-teamPassword') || '';

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || session.user.name, teamId, teamPassword }),
      });

      sessionStorage.removeItem('signup-teamId');
      sessionStorage.removeItem('signup-teamPassword');

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '登録に失敗しました');
      }

      // DB更新成功 → サインアウトして再サインインすることでJWTをリフレッシュ
      await signOut({ redirect: false });
      await signIn('microsoft-entra-id', { redirectTo: '/prompts' });
    } catch (e) {
      console.error('Registration error:', e);
      setError(e instanceof Error ? e.message : '登録に失敗しました');
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
          <Stack direction="column" sx={{ alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography variant="h5" component="h1">
              登録を完了する
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {session.user.email}
            </Typography>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {error && (
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={async () => {
                sessionStorage.removeItem('signup-teamId');
                sessionStorage.removeItem('signup-teamPassword');
                await signOut({ redirect: false });
                router.push('/signup');
              }}
              sx={{ mb: 2, py: 1.5 }}
            >
              サインアップ画面に戻る
            </Button>
          )}

          <TextField
            label="表示名"
            fullWidth
            defaultValue={session.user.name ?? ''}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleComplete}
            disabled={loading}
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : '登録を完了'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
