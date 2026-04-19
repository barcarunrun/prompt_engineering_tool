import { LLMModel } from '@/types/prompt';

export const LLM_MODELS: LLMModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: '最新の高性能マルチモーダルモデル',
    maxTokens: 128000,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'OpenAI',
    description: '高速・低コストな軽量モデル',
    maxTokens: 128000,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: '高性能な大規模言語モデル',
    maxTokens: 128000,
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: '高品質な応答を生成するモデル',
    maxTokens: 200000,
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: '最高性能のAnthropicモデル',
    maxTokens: 200000,
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    description: '高速・低コストなモデル',
    maxTokens: 200000,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    description: '長文コンテキスト対応の高性能モデル',
    maxTokens: 1000000,
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    description: '高速応答に最適化されたモデル',
    maxTokens: 1000000,
  },
];

export const DEFAULT_MODEL_ID = 'gpt-4o';
