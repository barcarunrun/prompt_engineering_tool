'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ScienceIcon from '@mui/icons-material/Science';
import AddIcon from '@mui/icons-material/Add';
import Link from 'next/link';
import { MOCK_PROMPTS } from '@/constants/prompts';
import { LLM_MODELS } from '@/constants/models';
import { PromptStatus } from '@/types/prompt';

const STATUS_CONFIG: Record<PromptStatus, { label: string; color: 'success' | 'warning' | 'default' }> = {
  published: { label: '公開中', color: 'success' },
  draft: { label: '下書き', color: 'warning' },
  archived: { label: 'アーカイブ', color: 'default' },
};

function getModelName(modelId: string): string {
  const model = LLM_MODELS.find((m) => m.id === modelId);
  return model ? model.name : modelId;
}

function getProviderName(modelId: string): string {
  const model = LLM_MODELS.find((m) => m.id === modelId);
  return model ? model.provider : '';
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: '#10a37f',
  Anthropic: '#d4a574',
  Google: '#4285f4',
};

export default function PromptsListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PromptStatus | 'all'>('all');

  const filteredPrompts = MOCK_PROMPTS.filter((prompt) => {
    const matchesSearch =
      !searchQuery ||
      prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || prompt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box>
      {/* ヘッダー */}
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
          <Typography variant="h5">プロンプト一覧</Typography>
          <Chip label={`${MOCK_PROMPTS.length}件`} size="small" variant="outlined" />
        </Stack>
        <Button variant="contained" startIcon={<AddIcon />} size="medium">
          新規作成
        </Button>
      </Box>

      {/* フィルター */}
      <Stack direction="row" sx={{ gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="プロンプトを検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 280 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>ステータス</InputLabel>
          <Select
            value={statusFilter}
            label="ステータス"
            onChange={(e) => setStatusFilter(e.target.value as PromptStatus | 'all')}
          >
            <MenuItem value="all">すべて</MenuItem>
            <MenuItem value="published">公開中</MenuItem>
            <MenuItem value="draft">下書き</MenuItem>
            <MenuItem value="archived">アーカイブ</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* プロンプト一覧 */}
      {filteredPrompts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            該当するプロンプトが見つかりません
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredPrompts.map((prompt) => {
            const statusConfig = STATUS_CONFIG[prompt.status];
            const providerName = getProviderName(prompt.modelId);
            const providerColor = PROVIDER_COLORS[providerName] || '#666';

            return (
              <Grid key={prompt.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                    '&:hover': {
                      boxShadow: 3,
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <CardContent sx={{ flex: 1, pb: 1 }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                        {prompt.name}
                      </Typography>
                      <Chip
                        label={statusConfig.label}
                        color={statusConfig.color}
                        size="small"
                        sx={{ ml: 1, flexShrink: 0 }}
                      />
                    </Stack>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '2.5em',
                      }}
                    >
                      {prompt.description}
                    </Typography>

                    <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                      <Chip
                        label={getModelName(prompt.modelId)}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: providerColor,
                          color: providerColor,
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      />
                      <Chip
                        label={`v${prompt.latestVersion}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </Stack>

                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">
                        作成者: {prompt.createdBy}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        更新: {formatDate(prompt.updatedAt)}
                      </Typography>
                    </Stack>
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                    <Button
                      component={Link}
                      href={`/prompts/verify?id=${prompt.id}`}
                      variant="outlined"
                      size="small"
                      startIcon={<ScienceIcon />}
                      fullWidth
                    >
                      検証する
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
