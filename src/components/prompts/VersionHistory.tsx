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

interface VersionHistoryProps {
  versions?: PromptVersion[];
  onRestore: (content: string) => void;
  currentVersion?: number;
}

export default function VersionHistory({
  versions = [],
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
        {versions.map((version, index) => (
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
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                    <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(version.createdAt)} · {version.createdBy}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
            {index < versions.length - 1 && (
              <Divider variant="middle" component="li" sx={{ my: 0.5 }} />
            )}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}
