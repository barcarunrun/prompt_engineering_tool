'use client';

import React from 'react';
import {
  Paper,
  Typography,
  TextField,
  Box,
  Chip,
  Stack,
} from '@mui/material';

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PromptEditor({ value, onChange }: PromptEditorProps) {
  // プロンプト内の {{変数名}} を抽出
  const variables = React.useMemo(() => {
    const matches = value.match(/\{\{(\w+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))];
  }, [value]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ mb: 2, fontWeight: 600 }}
      >
        プロンプト
      </Typography>

      <TextField
        multiline
        fullWidth
        minRows={12}
        maxRows={20}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`プロンプトを入力してください...\n\n例:\n以下のテキストを要約してください。\n要約は{{maxLength}}文字以内にしてください。\n\nテキスト:\n{{text}}`}
        variant="outlined"
        sx={{
          flexGrow: 1,
          '& .MuiOutlinedInput-root': {
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            lineHeight: 1.7,
            alignItems: 'flex-start',
          },
        }}
      />

      {variables.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            検出された変数:
          </Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {variables.map((v) => (
              <Chip
                key={v}
                label={`{{${v}}}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5 }}>
        💡 {'{{変数名}}'} 形式でプレースホルダーを使用できます
      </Typography>
    </Paper>
  );
}
