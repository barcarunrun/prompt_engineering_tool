'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  Avatar,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  isRegistered: boolean;
  createdAt: string;
}

const ROLE_CONFIG: Record<string, { label: string; color: 'error' | 'primary' | 'default' }> = {
  admin: { label: '管理者', color: 'error' },
  member: { label: 'メンバー', color: 'primary' },
  viewer: { label: '閲覧者', color: 'default' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && (session?.user as { role?: string })?.role !== 'admin') {
      router.replace('/prompts');
    }
  }, [status, session, router]);

  if (status === 'loading' || (session?.user as { role?: string })?.role !== 'admin') {
    return null;
  }

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error('Failed to fetch users:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      (user.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        ユーザ管理
      </Typography>

      <TextField
        placeholder="ユーザ名またはメールで検索..."
        size="small"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3, width: 360 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ユーザ</TableCell>
              <TableCell>メール</TableCell>
              <TableCell>ロール</TableCell>
              <TableCell>登録状態</TableCell>
              <TableCell>作成日</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => {
              const roleConfig = ROLE_CONFIG[user.role] ?? { label: user.role, color: 'default' as const };
              return (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={user.image ?? undefined} sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                        {(user.name ?? user.email)[0]}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {user.name ?? '(未設定)'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={roleConfig.label} color={roleConfig.color} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isRegistered ? '登録済み' : '未登録'}
                      color={user.isRegistered ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                </TableRow>
              );
            })}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">該当するユーザが見つかりません</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
