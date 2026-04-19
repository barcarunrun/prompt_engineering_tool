'use client';

import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Divider,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { PromptVersion } from '@/types/prompt';

// ダミーのバージョン履歴データ
const MOCK_VERSIONS: PromptVersion[] = [
  {
    id: 'v5',
    version: 5,
    content:
      '以下のテキストを日本語で要約してください。要約は{{maxLength}}文字以内で、重要なポイントを箇条書きにしてください。\n\nテキスト:\n{{text}}',
    createdAt: '2026-04-19T10:30:00',
    createdBy: 'テストユーザー',
    description: '箇条書き形式を追加',
  },
  {
    id: 'v4',
    version: 4,
    content:
      '以下のテキストを要約してください。要約は{{maxLength}}文字以内にしてください。\n\nテキスト:\n{{text}}',
    createdAt: '2026-04-18T15:20:00',
    createdBy: 'テストユーザー',
    description: '文字数制限パラメータを追加',
  },
  {
    id: 'v3',
    version: 3,
    content:
      '以下のテキストを要約してください。できるだけ簡潔にまとめてください。\n\nテキスト:\n{{text}}',
    createdAt: '2026-04-17T09:15:00',
    createdBy: '田中太郎',
    description: '簡潔さの指示を追加',
  },
  {
    id: 'v2',
    version: 2,
    content: '以下のテキストを要約してください。\n\nテキスト:\n{{text}}',
    createdAt: '2026-04-16T14:00:00',
    createdBy: '田中太郎',
    description: '変数プレースホルダーを導入',
  },
  {
    id: 'v1',
    version: 1,
    content: '以下のテキストを要約してください。',
    createdAt: '2026-04-15T11:00:00',
    createdBy: 'テストユーザー',
    description: '初版作成',
  },
];

interface VersionHistoryProps {
  onRestore: (content: string) => void;
  currentVersion?: number;
}

export default function VersionHistory({
  onRestore,
  currentVersion,
}: VersionHistoryProps) {
  const [selectedVersionId, setSelectedVersionId] = React.useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopy = (content: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
  };

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <RestoreIcon fontSize="small" color="action" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          バージョン履歴
        </Typography>
      </Box>

      <List
        disablePadding
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          mx: -1,
        }}
      >
        {MOCK_VERSIONS.map((version, index) => (
          <React.Fragment key={version.id}>
            <ListItem
              disablePadding
              secondaryAction={
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="クリップボードにコピー">
                    <IconButton
                      size="small"
                      onClick={(e) => handleCopy(version.content, e)}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemButton
                selected={selectedVersionId === version.id}
                onClick={() => {
                  setSelectedVersionId(version.id);
                  onRestore(version.content);
                }}
                sx={{
                  borderRadius: 1,
                  px: 1.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.50',
                    borderLeft: '3px solid',
                    borderLeftColor: 'primary.main',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={`v${version.version}`}
                        size="small"
                        color={
                          currentVersion === version.version
                            ? 'primary'
                            : 'default'
                        }
                        sx={{ fontWeight: 600, minWidth: 40 }}
                      />
                      <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                        {version.description}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(version.createdAt)} · {version.createdBy}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
            {index < MOCK_VERSIONS.length - 1 && (
              <Divider variant="middle" component="li" sx={{ my: 0.5 }} />
            )}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}
