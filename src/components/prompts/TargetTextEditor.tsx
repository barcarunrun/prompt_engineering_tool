'use client';

import React from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  CircularProgress,
  Chip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface TargetTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  result: string;
  isExecuting: boolean;
  onExecute: () => void;
  tokenUsage?: { prompt: number; completion: number; total: number };
}

export default function TargetTextEditor({
  value,
  onChange,
  result,
  isExecuting,
  onExecute,
  tokenUsage,
}: TargetTextEditorProps) {
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
        適用テキスト
      </Typography>

      <TextField
        multiline
        fullWidth
        minRows={6}
        maxRows={10}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="プロンプトを適用させるテキストを入力してください..."
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            fontSize: '0.875rem',
            lineHeight: 1.7,
            alignItems: 'flex-start',
          },
        }}
      />

      <Button
        variant="contained"
        startIcon={
          isExecuting ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <PlayArrowIcon />
          )
        }
        onClick={onExecute}
        disabled={isExecuting}
        sx={{ mt: 2, alignSelf: 'flex-start' }}
      >
        {isExecuting ? '実行中...' : '実行'}
      </Button>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          実行結果
        </Typography>
        {tokenUsage && (
          <Chip
            label={`${tokenUsage.total.toLocaleString()} tokens`}
            size="small"
            variant="outlined"
            color="info"
          />
        )}
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          flexGrow: 1,
          minHeight: 120,
          bgcolor: result ? 'grey.50' : 'transparent',
          overflow: 'auto',
        }}
      >
        {isExecuting ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: 100,
            }}
          >
            <CircularProgress size={32} />
          </Box>
        ) : result ? (
          <Typography
            variant="body2"
            sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
          >
            {result}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            プロンプトを実行すると結果がここに表示されます
          </Typography>
        )}
      </Paper>
    </Paper>
  );
}
