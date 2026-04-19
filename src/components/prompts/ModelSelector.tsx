'use client';

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemText,
  Box,
  Chip,
} from '@mui/material';
import { LLM_MODELS, DEFAULT_MODEL_ID } from '@/constants/models';

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
}

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const selectedModel = LLM_MODELS.find((m) => m.id === value);

  // プロバイダーごとにグルーピング
  const providers = [...new Set(LLM_MODELS.map((m) => m.provider))];

  return (
    <FormControl size="small" sx={{ minWidth: 260 }}>
      <InputLabel id="model-select-label">LLMモデル</InputLabel>
      <Select
        labelId="model-select-label"
        value={value || DEFAULT_MODEL_ID}
        label="LLMモデル"
        onChange={(e) => onChange(e.target.value)}
        renderValue={() => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedModel && (
              <>
                <Chip
                  label={selectedModel.provider}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    bgcolor:
                      selectedModel.provider === 'OpenAI'
                        ? '#10a37f'
                        : selectedModel.provider === 'Groq'
                        ? '#f55036'
                        : '#666',
                    color: 'white',
                  }}
                />
                {selectedModel.name}
              </>
            )}
          </Box>
        )}
      >
        {providers.map((provider) => [
          <MenuItem key={`header-${provider}`} disabled sx={{ opacity: 1 }}>
            <ListItemText
              primary={provider}
              slotProps={{
                primary: {
                  variant: 'caption' as const,
                  sx: {
                    fontWeight: 700,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  },
                },
              }}
            />
          </MenuItem>,
          ...LLM_MODELS.filter((m) => m.provider === provider).map((model) => (
            <MenuItem key={model.id} value={model.id} sx={{ pl: 3 }}>
              <ListItemText
                primary={model.name}
                secondary={model.description}
                slotProps={{
                  primary: { sx: { fontSize: '0.875rem' } },
                  secondary: { sx: { fontSize: '0.75rem' } },
                }}
              />
            </MenuItem>
          )),
        ])}
      </Select>
    </FormControl>
  );
}
