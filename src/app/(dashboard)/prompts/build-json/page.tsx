'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  IconButton,
  Divider,
  Alert,
  Chip,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SaveIcon from '@mui/icons-material/Save';
import ModelSelector from '@/components/prompts/ModelSelector';
import { DEFAULT_MODEL_ID } from '@/constants/models';
import { useRouter } from 'next/navigation';

const SYSTEM_PROMPT = `あなたはテストデータ生成の専門家です。
ユーザーの指示に従って、適用テキスト（LLMのプロンプトに入力するテスト用テキスト）を生成してください。

【出力ルール】
- 必ずJSON配列形式で出力してください。
- 各要素は文字列です。
- JSON以外の文字（説明文など）は一切出力しないでください。
- 出力例: ["テキスト1", "テキスト2", "テキスト3"]`;

export default function BuildJsonPage() {
  const router = useRouter();
  const [instruction, setInstruction] = useState('');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL_ID);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [snackMsg, setSnackMsg] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const [tokenUsage, setTokenUsage] = useState<{ prompt: number; completion: number; total: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);

  // Load from sessionStorage if editing existing set
  useEffect(() => {
    const editData = sessionStorage.getItem('build-json-edit');
    if (editData) {
      sessionStorage.removeItem('build-json-edit');
      try {
        const { id, name, texts } = JSON.parse(editData);
        setItems(texts);
        setSaveName(name);
        setEditingSetId(id);
        setSnackMsg(`「${name}」を読み込みました`);
      } catch { /* ignore */ }
    }
  }, []);

  // --- LLM生成 ---
  const handleGenerate = async () => {
    if (!instruction.trim()) return;
    setIsGenerating(true);
    setError('');
    setTokenUsage(null);

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: SYSTEM_PROMPT,
          targetText: instruction,
          modelId: selectedModel,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'LLM実行に失敗しました');
        return;
      }

      setTokenUsage(data.tokenUsage);

      // Parse JSON array from output
      const output: string = data.output;
      const match = output.match(/\[[\s\S]*\]/);
      if (!match) {
        setError('LLMの出力からJSON配列を検出できませんでした。指示を変えて再試行してください。');
        return;
      }
      const parsed = JSON.parse(match[0]);
      if (!Array.isArray(parsed)) {
        setError('出力がJSON配列ではありません。');
        return;
      }
      const texts = parsed.map((item: unknown) => (typeof item === 'string' ? item : String(item)));
      setItems(texts);
      setIsEditing(false);
      setSnackMsg(`${texts.length}件のテキストを生成しました`);
    } catch (err) {
      setError(`エラー: ${err instanceof Error ? err.message : '不明なエラー'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- 編集 ---
  const updateItem = (index: number, value: string) => {
    setItems((prev) => prev.map((v, i) => (i === index ? value : v)));
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setItems((prev) => [...prev, '']);
    setIsEditing(true);
  };

  // --- ファイルインポート ---
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const ext = file.name.split('.').pop()?.toLowerCase();
      try {
        if (ext === 'json') {
          const parsed = JSON.parse(content);
          if (!Array.isArray(parsed)) { setError('JSONは配列形式である必要があります。'); return; }
          const texts = parsed.map((item: unknown) => {
            if (typeof item === 'string') return item;
            if (typeof item === 'object' && item !== null && 'text' in item && typeof (item as { text: unknown }).text === 'string') return (item as { text: string }).text;
            throw new Error('invalid');
          });
          setItems(texts);
        } else {
          const texts = content.split('\n').map((l) => l.trim()).filter(Boolean);
          setItems(texts);
        }
        setIsEditing(false);
        setSnackMsg('ファイルからインポートしました');
      } catch {
        setError('ファイルの解析に失敗しました。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // --- JSON出力 ---
  const nonEmptyItems = items.filter((t) => t.trim() !== '');
  const jsonOutput = JSON.stringify(nonEmptyItems, null, 2);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setSnackMsg('クリップボードにコピーしました');
    } catch {
      setSnackMsg('コピーに失敗しました');
    }
  };

  const downloadJson = () => {
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `target-texts-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const goToBatchVerify = () => {
    if (nonEmptyItems.length === 0) { setSnackMsg('テキストが0件です'); return; }
    sessionStorage.setItem('batch-verify-targets', JSON.stringify(nonEmptyItems));
    router.push('/prompts/batch-verify');
  };

  const handleSave = async () => {
    if (!saveName.trim() || nonEmptyItems.length === 0) return;
    setIsSaving(true);
    try {
      const url = editingSetId
        ? `/api/target-text-sets/${editingSetId}`
        : '/api/target-text-sets';
      const method = editingSetId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: saveName.trim(), texts: nonEmptyItems }),
      });
      if (res.ok) {
        const data = await res.json();
        if (!editingSetId) setEditingSetId(data.id);
        setSnackMsg('保存しました');
        setSaveDialogOpen(false);
      } else {
        const data = await res.json();
        setError(data.error || '保存に失敗しました');
      }
    } catch {
      setError('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        適用テキストJSON作成
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        LLMに指示を出して、一括検証用の適用テキストJSON配列を自動生成します。
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left: Instruction + Generation */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* 指示入力 */}
          <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              生成指示
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={4}
              maxRows={10}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder={'例: 製品へのクレームメールを20件作って。丁寧な文面と怒りの文面を混ぜてください。'}
              variant="outlined"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { fontSize: '0.875rem', lineHeight: 1.7 } }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <Button
                variant="contained"
                startIcon={isGenerating ? <CircularProgress size={18} color="inherit" /> : <AutoFixHighIcon />}
                onClick={handleGenerate}
                disabled={isGenerating || !instruction.trim()}
              >
                {isGenerating ? '生成中...' : 'LLMで生成'}
              </Button>
            </Box>
            {tokenUsage && (
              <Chip
                label={`${tokenUsage.total.toLocaleString()} tokens (prompt: ${tokenUsage.prompt.toLocaleString()} / completion: ${tokenUsage.completion.toLocaleString()})`}
                size="small"
                variant="outlined"
                color="info"
                sx={{ mt: 1.5 }}
              />
            )}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
          </Paper>

          {/* 生成結果一覧 (編集可能) */}
          {items.length > 0 && (
            <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  生成結果
                  <Chip label={`${nonEmptyItems.length}件`} size="small" sx={{ ml: 1 }} />
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing((v) => !v)}
                  >
                    {isEditing ? '編集終了' : '編集'}
                  </Button>
                  <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={addItem}>
                    追加
                  </Button>
                </Stack>
              </Box>
              <Stack spacing={1} sx={{ maxHeight: 'calc(100vh - 520px)', overflow: 'auto', pr: 0.5 }}>
                {items.map((text, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <Chip label={index + 1} size="small" variant="outlined" sx={{ mt: isEditing ? 1 : 0.3, minWidth: 32 }} />
                    {isEditing ? (
                      <TextField
                        fullWidth
                        multiline
                        minRows={1}
                        maxRows={4}
                        value={text}
                        onChange={(e) => updateItem(index, e.target.value)}
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.85rem' } }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ flex: 1, py: 0.5, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {text}
                      </Typography>
                    )}
                    {isEditing && (
                      <IconButton size="small" color="error" onClick={() => removeItem(index)} sx={{ mt: 0.5 }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Stack>
            </Paper>
          )}
        </Box>

        {/* Right: JSON Preview + Actions */}
        <Paper elevation={0} sx={{ width: { xs: '100%', md: 420 }, p: 2.5, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', alignSelf: 'flex-start', position: { md: 'sticky' }, top: { md: 80 } }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            JSONプレビュー
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              minHeight: 200,
              maxHeight: 'calc(100vh - 400px)',
              overflow: 'auto',
              bgcolor: 'grey.50',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {nonEmptyItems.length > 0 ? jsonOutput : '// LLMで生成するとプレビューが表示されます'}
          </Paper>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={copyToClipboard}
              disabled={nonEmptyItems.length === 0}
              fullWidth
            >
              クリップボードにコピー
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadJson}
              disabled={nonEmptyItems.length === 0}
              fullWidth
            >
              JSONファイルをダウンロード
            </Button>
            <Divider />
            <input
              type="file"
              accept=".json,.csv,.txt"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileImport}
            />
            <Button
              variant="outlined"
              startIcon={<UploadFileIcon />}
              onClick={() => fileInputRef.current?.click()}
              fullWidth
            >
              ファイルからインポート
            </Button>
            <Divider />
            <Button
              variant="contained"
              color="success"
              startIcon={<SaveIcon />}
              onClick={() => setSaveDialogOpen(true)}
              disabled={nonEmptyItems.length === 0}
              fullWidth
            >
              {editingSetId ? '上書き保存' : '保存'}
            </Button>
            <Button
              variant="contained"
              startIcon={<PlaylistPlayIcon />}
              onClick={goToBatchVerify}
              disabled={nonEmptyItems.length === 0}
              fullWidth
            >
              一括検証で使う
            </Button>
          </Stack>
        </Paper>
      </Box>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSetId ? '上書き保存' : '適用テキストセットを保存'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="名前"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="例: クレームメール20件"
            sx={{ mt: 1 }}
            autoFocus
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {nonEmptyItems.length}件のテキストを保存します。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>キャンセル</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!saveName.trim() || isSaving}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          >
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snackMsg} autoHideDuration={3000} onClose={() => setSnackMsg('')} message={snackMsg} />
    </Box>
  );
}
