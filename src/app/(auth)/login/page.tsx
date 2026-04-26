'use client';

import React from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Stack,
  CircularProgress,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();

  React.useEffect(() => {
    if (status === 'authenticated') {
      router.push('/prompts');
    }
  }, [status, router]);

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
          <Stack direction="column" sx={{ alignItems: 'center', gap: 2, mb: 4 }}>
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

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => signIn('microsoft-entra-id', { redirectTo: '/prompts' })}
            sx={{ py: 1.5 }}
          >
            Microsoft アカウントでサインイン
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [teamId, setTeamId] = useState('');

  React.useEffect(() => {
    if (status === 'authenticated') {
      router.push('/prompts');
    }
  }, [status, router]);

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
    sessionStorage.setItem('login-teamId', teamId.trim());
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
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="チームIDを入力"
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleLogin}
            disabled={!teamId.trim()}
            sx={{ mt: 1, py: 1.5 }}
          >
            Microsoft アカウントでログイン
          </Button>

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

