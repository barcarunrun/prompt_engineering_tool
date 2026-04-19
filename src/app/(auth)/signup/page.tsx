'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Stack,
  TextField,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';

export default function SignUpPage() {
  const [teamId, setTeamId] = useState('');
  const [teamPassword, setTeamPassword] = useState('');

  const canProceed = teamId.trim() !== '' && teamPassword.trim() !== '';

  const handleSignUp = () => {
    sessionStorage.setItem('signup-teamId', teamId.trim());
    sessionStorage.setItem('signup-teamPassword', teamPassword.trim());
    signIn('microsoft-entra-id', { redirectTo: '/signup/complete' });
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
            <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography variant="h5" component="h1">
              サインアップ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Microsoft アカウントで新規登録します
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
            onClick={handleSignUp}
            disabled={!canProceed}
            sx={{ mt: 1, py: 1.5 }}
          >
            Microsoft アカウントで登録
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 2 }}
          >
            既にアカウントをお持ちですか？{' '}
            <a href="/login" style={{ color: '#1976d2', textDecoration: 'none' }}>
              ログイン
            </a>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
