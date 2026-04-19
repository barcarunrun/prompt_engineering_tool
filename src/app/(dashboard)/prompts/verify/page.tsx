'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Grid, Typography, Stack, Chip, Button, IconButton, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import PromptEditor from '@/components/prompts/PromptEditor';
import TargetTextEditor from '@/components/prompts/TargetTextEditor';
import VersionHistory from '@/components/prompts/VersionHistory';
import ModelSelector from '@/components/prompts/ModelSelector';
import { DEFAULT_MODEL_ID } from '@/constants/models';
import { MOCK_PROMPTS } from '@/constants/prompts';

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
  const [currentVersion, setCurrentVersion] = useState(5);

  // クエリパラメータからプロンプトを読み込む
  useEffect(() => {
    if (promptId) {
      const found = MOCK_PROMPTS.find((p) => p.id === promptId);
      if (found) {
        setPromptText(found.content);
        setSelectedModel(found.modelId);
        setPromptName(found.name);
        setCurrentVersion(found.latestVersion);
      }
    }
  }, [promptId]);

  const handleExecute = useCallback(async () => {
    if (!promptText.trim()) return;
    setIsExecuting(true);
    setResult('');
    setTokenUsage(undefined);

    // モック実行: 2秒の遅延後にダミー結果を返す
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockResult = `【実行結果 - モックデータ】\n\n使用モデル: ${selectedModel}\n\n--- プロンプト適用結果 ---\n\n${
      targetText
        ? `入力テキストに対してプロンプトを適用しました。\n\n「${targetText.substring(0, 100)}${
            targetText.length > 100 ? '...' : ''
          }」\n\nに対する処理結果がここに表示されます。\n\n※ 実際のLLM API連携後は、AIモデルの応答がここに表示されます。`
        : 'プロンプトの実行結果がここに表示されます。\n\n※ 「適用テキスト」エリアにテキストを入力して実行すると、\nプロンプトがそのテキストに適用された結果が表示されます。'
    }`;

    setResult(mockResult);
    setTokenUsage({
      prompt: Math.floor(Math.random() * 500) + 100,
      completion: Math.floor(Math.random() * 300) + 50,
      total: Math.floor(Math.random() * 800) + 150,
    });
    setIsExecuting(false);
  }, [promptText, targetText, selectedModel]);

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
          >
            保存
          </Button>
        </Stack>
      </Box>

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
          <VersionHistory onRestore={handleRestoreVersion} currentVersion={currentVersion} />
        </Grid>
      </Grid>
    </Box>
  );
}
