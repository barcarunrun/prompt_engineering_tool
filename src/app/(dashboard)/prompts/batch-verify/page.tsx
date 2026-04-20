'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ButtonGroup,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DownloadIcon from '@mui/icons-material/Download';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ModelSelector from '@/components/prompts/ModelSelector';
import { DEFAULT_MODEL_ID } from '@/constants/models';
import type { Prompt } from '@/types/prompt';

interface TargetItem {
  id: string;
  text: string;
  result: string;
  status: 'idle' | 'running' | 'done' | 'error';
  tokenUsage?: { prompt: number; completion: number; total: number };
}

let nextId = 1;

function createTarget(text = ''): TargetItem {
  return { id: String(nextId++), text, result: '', status: 'idle' };
}

// --- Download helpers ---

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCsvField(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

export default function BatchVerifyPage() {
  const [promptText, setPromptText] = useState('');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL_ID);
  const [targets, setTargets] = useState<TargetItem[]>([createTarget(), createTarget()]);
  const [isRunning, setIsRunning] = useState(false);

  // 既存プロンプト引用
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');

  // JSON一括登録
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');

  // targets ref for sequential execution
  const targetsRef = useRef(targets);
  targetsRef.current = targets;

  // sessionStorageからのインポート（JSON作成画面から遷移時）
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('batch-verify-targets');
      if (stored) {
        const texts: string[] = JSON.parse(stored);
        if (Array.isArray(texts) && texts.length > 0) {
          setTargets(texts.map((t) => createTarget(typeof t === 'string' ? t : '')));
        }
        sessionStorage.removeItem('batch-verify-targets');
      }
    } catch { /* ignore */ }
  }, []);

  // 既存プロンプト一覧の取得
  useEffect(() => {
    fetch('/api/prompts')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPrompts(data);
      })
      .catch(() => {});
  }, []);

  // 既存プロンプト選択時
  const handleSelectPrompt = (promptId: string) => {
    setSelectedPromptId(promptId);
    if (!promptId) return;
    const found = prompts.find((p) => p.id === promptId);
    if (found) {
      setPromptText(found.content);
      setSelectedModel(found.modelId);
    }
  };

  // JSON一括登録
  const handleJsonImport = () => {
    setJsonError('');
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        setJsonError('JSONは配列形式で入力してください。例: ["テキスト1", "テキスト2"] または [{"text": "テキスト1"}]');
        return;
      }
      const texts: string[] = parsed.map((item: unknown) => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null && 'text' in item && typeof (item as { text: unknown }).text === 'string') {
          return (item as { text: string }).text;
        }
        throw new Error('invalid');
      });
      if (texts.length === 0) {
        setJsonError('配列が空です。');
        return;
      }
      setTargets(texts.map((t) => createTarget(t)));
      setJsonInput('');
    } catch {
      setJsonError('JSONのパースに失敗しました。文字列配列 ["a","b"] またはオブジェクト配列 [{"text":"a"}] 形式で入力してください。');
    }
  };

  const addTarget = () => {
    setTargets((prev) => [...prev, createTarget()]);
  };

  const removeTarget = (id: string) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTargetText = (id: string, text: string) => {
    setTargets((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
  };

  // 逐次実行（実API呼び出し）
  const handleExecuteAll = useCallback(async () => {
    if (!promptText.trim()) return;
    setIsRunning(true);

    // Reset results and mark targets with text as running
    setTargets((prev) =>
      prev.map((t) => (t.text.trim() ? { ...t, status: 'running', result: '', tokenUsage: undefined } : t))
    );

    const snapshot = targetsRef.current;

    for (let i = 0; i < snapshot.length; i++) {
      const target = snapshot[i];
      if (!target.text.trim()) continue;

      try {
        const res = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: promptText,
            targetText: target.text,
            modelId: selectedModel,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          setTargets((prev) =>
            prev.map((t) =>
              t.id === target.id ? { ...t, status: 'error', result: `エラー: ${data.error || res.statusText}` } : t
            )
          );
        } else {
          setTargets((prev) =>
            prev.map((t) =>
              t.id === target.id
                ? { ...t, status: 'done', result: data.output, tokenUsage: data.tokenUsage }
                : t
            )
          );
        }
      } catch (err) {
        setTargets((prev) =>
          prev.map((t) =>
            t.id === target.id
              ? { ...t, status: 'error', result: `通信エラー: ${err instanceof Error ? err.message : '不明'}` }
              : t
          )
        );
      }
    }

    setIsRunning(false);
  }, [promptText, selectedModel]);

  const completedCount = targets.filter((t) => t.status === 'done').length;
  const errorCount = targets.filter((t) => t.status === 'error').length;
  const totalWithText = targets.filter((t) => t.text.trim()).length;
  const hasResults = completedCount > 0 || errorCount > 0;

  // --- ダウンロード ---
  const getResultData = () =>
    targets
      .filter((t) => t.status === 'done' || t.status === 'error')
      .map((t) => ({
        input: t.text,
        output: t.result,
        model: selectedModel,
        status: t.status,
        tokenUsage: t.tokenUsage ?? { prompt: 0, completion: 0, total: 0 },
      }));

  const downloadJson = () => {
    const data = getResultData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `batch-result-${Date.now()}.json`);
  };

  const downloadCsv = () => {
    const data = getResultData();
    const header = '入力テキスト,出力,モデル,ステータス,プロンプトトークン,完了トークン,合計トークン';
    const rows = data.map(
      (d) =>
        [
          escapeCsvField(d.input),
          escapeCsvField(d.output),
          escapeCsvField(d.model),
          escapeCsvField(d.status),
          d.tokenUsage.prompt,
          d.tokenUsage.completion,
          d.tokenUsage.total,
        ].join(',')
    );
    const csv = '\uFEFF' + [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    downloadBlob(blob, `batch-result-${Date.now()}.csv`);
  };

  const downloadMarkdown = () => {
    const data = getResultData();
    const lines = [
      '# プロンプト一括検証結果',
      '',
      `**プロンプト:**`,
      '```',
      promptText,
      '```',
      '',
      `**モデル:** ${selectedModel}`,
      '',
      '---',
      '',
    ];
    data.forEach((d, i) => {
      lines.push(`## テキスト #${i + 1}`);
      lines.push('');
      lines.push('### 入力');
      lines.push('```');
      lines.push(d.input);
      lines.push('```');
      lines.push('');
      lines.push('### 出力');
      lines.push('```');
      lines.push(d.output);
      lines.push('```');
      lines.push('');
      if (d.status === 'done') {
        lines.push(`> トークン — プロンプト: ${d.tokenUsage.prompt} / 完了: ${d.tokenUsage.completion} / 合計: ${d.tokenUsage.total}`);
      } else {
        lines.push(`> ステータス: エラー`);
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, `batch-result-${Date.now()}.md`);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        プロンプト一括検証
      </Typography>

      {/* プロンプト入力 */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        {/* 既存プロンプト引用 */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormatQuoteIcon color="action" fontSize="small" />
          <FormControl size="small" sx={{ minWidth: 320 }}>
            <InputLabel id="quote-prompt-label">既存プロンプトから引用</InputLabel>
            <Select
              labelId="quote-prompt-label"
              value={selectedPromptId}
              label="既存プロンプトから引用"
              onChange={(e) => handleSelectPrompt(e.target.value)}
            >
              <MenuItem value="">
                <em>引用なし（手動入力）</em>
              </MenuItem>
              {prompts.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}{p.description ? ` — ${p.description}` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          プロンプト
        </Typography>
        <TextField
          multiline
          minRows={4}
          maxRows={10}
          fullWidth
          placeholder="検証したいプロンプトを入力してください..."
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
        />
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <ModelSelector value={selectedModel} onChange={setSelectedModel} />
          <Button
            variant="contained"
            startIcon={isRunning ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />}
            onClick={handleExecuteAll}
            disabled={isRunning || !promptText.trim() || totalWithText === 0}
          >
            {isRunning ? '実行中...' : '一括実行'}
          </Button>
          {totalWithText > 0 && (
            <Chip
              label={`${completedCount} / ${totalWithText} 完了${errorCount > 0 ? ` (${errorCount}件エラー)` : ''}`}
              size="small"
              color={completedCount === totalWithText && completedCount > 0 ? 'success' : errorCount > 0 ? 'warning' : 'default'}
            />
          )}
        </Box>
      </Paper>

      {/* JSON一括登録 */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          適用テキストJSON一括登録
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          文字列配列 {`["テキスト1", "テキスト2"]`} またはオブジェクト配列 {`[{"text": "テキスト1"}, {"text": "テキスト2"}]`} 形式で入力
        </Typography>
        <TextField
          multiline
          minRows={3}
          maxRows={8}
          fullWidth
          placeholder={`["テキスト1", "テキスト2", "テキスト3"]`}
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value);
            setJsonError('');
          }}
          disabled={isRunning}
          size="small"
        />
        <Button
          variant="outlined"
          size="small"
          sx={{ mt: 1 }}
          onClick={handleJsonImport}
          disabled={isRunning || !jsonInput.trim()}
        >
          JSONから登録
        </Button>
        {jsonError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {jsonError}
          </Alert>
        )}
      </Paper>

      {/* 実行結果一覧 */}
      {hasResults && (
        <Paper variant="outlined" sx={{ mb: 3 }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              実行結果（{completedCount + errorCount} / {totalWithText}件）
            </Typography>
            <ButtonGroup variant="outlined" size="small">
              <Button startIcon={<DownloadIcon />} onClick={downloadJson}>JSON</Button>
              <Button startIcon={<DownloadIcon />} onClick={downloadCsv}>CSV</Button>
              <Button startIcon={<DownloadIcon />} onClick={downloadMarkdown}>Markdown</Button>
            </ButtonGroup>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 48 }}>#</TableCell>
                  <TableCell sx={{ width: 80 }}>状態</TableCell>
                  <TableCell sx={{ width: '35%' }}>入力テキスト</TableCell>
                  <TableCell sx={{ width: '45%' }}>出力結果</TableCell>
                  <TableCell sx={{ width: 120 }}>トークン</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {targets.map((target, index) => {
                  if (target.status === 'idle' && !target.result) return null;
                  return (
                    <TableRow key={target.id} hover sx={{ verticalAlign: 'top' }}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {target.status === 'running' && <CircularProgress size={16} />}
                        {target.status === 'done' && <CheckCircleIcon color="success" fontSize="small" />}
                        {target.status === 'error' && <ErrorIcon color="error" fontSize="small" />}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            maxHeight: 120,
                            overflow: 'auto',
                            fontSize: '0.8rem',
                          }}
                        >
                          {target.text}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1,
                            bgcolor: target.status === 'error' ? 'error.50' : 'grey.50',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            maxHeight: 200,
                            overflow: 'auto',
                            fontSize: '0.8rem',
                            fontFamily: 'monospace',
                          }}
                        >
                          {target.result}
                        </Paper>
                      </TableCell>
                      <TableCell>
                        {target.tokenUsage && (
                          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                            {target.tokenUsage.total}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {isRunning && !hasResults && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}
