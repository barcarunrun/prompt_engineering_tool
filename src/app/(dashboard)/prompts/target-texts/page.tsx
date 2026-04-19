'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { useRouter } from 'next/navigation';

interface TargetTextSetSummary {
  id: string;
  name: string;
  textCount: number;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

export default function TargetTextsPage() {
  const router = useRouter();
  const [sets, setSets] = useState<TargetTextSetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackMsg, setSnackMsg] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{ name: string; texts: string[] } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchSets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/target-text-sets');
      if (res.ok) setSets(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSets(); }, [fetchSets]);

  const handlePreview = async (id: string) => {
    const res = await fetch(`/api/target-text-sets/${id}`);
    if (res.ok) {
      const data = await res.json();
      setPreviewData({ name: data.name, texts: data.texts });
      setPreviewOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/target-text-sets/${deleteTarget}`, { method: 'DELETE' });
    if (res.ok) {
      setSnackMsg('削除しました');
      fetchSets();
    }
    setDeleteTarget(null);
  };

  const handleUseBatchVerify = async (id: string) => {
    const res = await fetch(`/api/target-text-sets/${id}`);
    if (res.ok) {
      const data = await res.json();
      sessionStorage.setItem('batch-verify-targets', JSON.stringify(data.texts));
      router.push('/prompts/batch-verify');
    }
  };

  const handleCopyJson = async (id: string) => {
    const res = await fetch(`/api/target-text-sets/${id}`);
    if (res.ok) {
      const data = await res.json();
      await navigator.clipboard.writeText(JSON.stringify(data.texts, null, 2));
      setSnackMsg('JSONをコピーしました');
    }
  };

  const handleEditInBuilder = async (id: string) => {
    const res = await fetch(`/api/target-text-sets/${id}`);
    if (res.ok) {
      const data = await res.json();
      sessionStorage.setItem('build-json-edit', JSON.stringify({ id: id, name: data.name, texts: data.texts }));
      router.push('/prompts/build-json');
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            保存済み適用テキスト一覧
          </Typography>
          <Typography variant="body2" color="text.secondary">
            作成・保存した適用テキストJSON一覧です。一括検証やJSON作成画面で利用できます。
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => router.push('/prompts/build-json')}>
          新規作成
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : sets.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
          <Typography color="text.secondary">保存された適用テキストセットはまだありません。</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>名前</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">件数</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>作成者</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>更新日時</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sets.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{s.name}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={`${s.textCount}件`} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{s.userName || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{formatDate(s.updatedAt)}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center' }}>
                      <Tooltip title="プレビュー">
                        <IconButton size="small" onClick={() => handlePreview(s.id)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="JSONコピー">
                        <IconButton size="small" onClick={() => handleCopyJson(s.id)}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="編集">
                        <IconButton size="small" onClick={() => handleEditInBuilder(s.id)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="一括検証で使う">
                        <IconButton size="small" color="primary" onClick={() => handleUseBatchVerify(s.id)}>
                          <PlaylistPlayIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="削除">
                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(s.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{previewData?.name}</DialogTitle>
        <DialogContent>
          <Paper variant="outlined" sx={{ p: 2, maxHeight: 400, overflow: 'auto', fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
            {previewData ? JSON.stringify(previewData.texts, null, 2) : ''}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>削除確認</DialogTitle>
        <DialogContent>
          <Typography>この適用テキストセットを削除しますか？この操作は取り消せません。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>キャンセル</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>削除</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snackMsg} autoHideDuration={3000} onClose={() => setSnackMsg('')} message={snackMsg} />
    </Box>
  );
}
