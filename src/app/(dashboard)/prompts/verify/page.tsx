'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Grid, Typography, Stack, Chip, Button, IconButton, Tooltip, TextField, Snackbar, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import PromptEditor from '@/components/prompts/PromptEditor';
import TargetTextEditor from '@/components/prompts/TargetTextEditor';
import VersionHistory from '@/components/prompts/VersionHistory';
import ModelSelector from '@/components/prompts/ModelSelector';
import { DEFAULT_MODEL_ID } from '@/constants/models';
import { PromptVersion } from '@/types/prompt';

export default function PromptVerifyPage() {
  const searchParams = useSearchParams();
  const promptId = searchParams.get('id');

  const [promptText, setPromptText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [result, setResult] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL_ID);
  const [tokenUsage, setTokenUsage] = useState<{
    prompt: number;
    completion: number;
    total: number;
  } | undefined>(undefined);
  const [promptName, setPromptName] = useState('');
  const [currentVersion, setCurrentVersion] = useState(1);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  // Extract variables from prompt
  const detectedVars = React.useMemo(() => {
    const matches = promptText.match(/\{\{(\w+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))];
  }, [promptText]);

  // Load prompt data from API
  useEffect(() => {
    if (promptId) {
      fetch(`/api/prompts/${promptId}`)
        .then((res) => res.json())
        .then((data) => {
          setPromptText(data.content || '');
          setSelectedModel(data.modelId || DEFAULT_MODEL_ID);
          setPromptName(data.name || '');
          setCurrentVersion(data.latestVersion || 1);
          if (data.versions) {
            setVersions(data.versions);
          }
        })
        .catch(console.error);
    }
  }, [promptId]);

  const fetchVersions = useCallback(async () => {
    if (!promptId) return;
    try {
      const res = await fetch(`/api/prompts/${promptId}/versions`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [promptId]);

  const handleExecute = useCallback(async () => {
    if (!promptText.trim()) return;
    setIsExecuting(true);
    setResult('');
    setTokenUsage(undefined);

    try {
      let res: Response;
      if (promptId) {
        // DB保存済みプロンプトの場合
        res = await fetch(`/api/prompts/${promptId}/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetText,
            variables,
            modelId: selectedModel,
          }),
        });
      } else {
        // 未保存 / 直接アクセスの場合
        res = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: promptText,
            targetText,
            variables,
            modelId: selectedModel,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setResult(`エラー: ${data.error || '実行に失敗しました'}`);
      } else {
        setResult(data.output);
        setTokenUsage(data.tokenUsage);
      }
    } catch {
      setResult('エラー: ネットワークエラーが発生しました');
    } finally {
      setIsExecuting(false);
    }
  }, [promptText, targetText, selectedModel, promptId, variables]);

  const handleSave = useCallback(async () => {
    if (!promptId) return;
    try {
      const res = await fetch(`/api/prompts/${promptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: promptText,
          modelId: selectedModel,
          description: `v${currentVersion + 1} 保存`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentVersion(data.latestVersion);
        await fetchVersions();
        setSnackbar({ open: true, message: '保存しました', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: '保存に失敗しました', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: '保存に失敗しました', severity: 'error' });
    }
  }, [promptId, promptText, selectedModel, currentVersion, fetchVersions]);

  const handleRestoreVersion = useCallback((content: string) => {
    setPromptText(content);
  }, []);

  return (
    <Box>
      {/* ヘッダーバー */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          <Tooltip title="プロンプト一覧に戻る">
            <IconButton component={Link} href="/prompts" size="small">
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h5">プロンプト検証</Typography>
          {promptName && (
            <Chip label={promptName} variant="outlined" size="small" />
          )}
          <Chip label={`v${currentVersion}`} color="primary" size="small" />
        </Stack>
        <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
          <ModelSelector value={selectedModel} onChange={setSelectedModel} />
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            size="medium"
            onClick={handleSave}
          >
            保存
          </Button>
        </Stack>
      </Box>

      {/* 変数入力エリア */}
      {detectedVars.length > 0 && (
        <Box sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            変数の値を入力
          </Typography>
          <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap' }}>
            {detectedVars.map((v) => (
              <TextField
                key={v}
                label={`{{${v}}}`}
                size="small"
                value={variables[v] || ''}
                onChange={(e) => setVariables((prev) => ({ ...prev, [v]: e.target.value }))}
                sx={{ minWidth: 200 }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* 3カラムレイアウト */}
      <Grid container spacing={2.5} sx={{ height: 'calc(100vh - 180px)' }}>
        {/* 左: プロンプト入力エリア */}
        <Grid size={{ xs: 12, md: 4 }}>
          <PromptEditor value={promptText} onChange={setPromptText} />
        </Grid>

        {/* 中央: 適用テキスト入力 + 結果表示 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <TargetTextEditor
            value={targetText}
            onChange={setTargetText}
            result={result}
            isExecuting={isExecuting}
            onExecute={handleExecute}
            tokenUsage={tokenUsage}
          />
        </Grid>

        {/* 右: バージョン履歴 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <VersionHistory
            versions={versions}
            onRestore={handleRestoreVersion}
            currentVersion={currentVersion}
          />
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
