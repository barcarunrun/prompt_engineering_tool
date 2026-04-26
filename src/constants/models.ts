import { LLMModel } from '@/types/prompt';

export const LLM_MODELS: LLMModel[] = [
  // Groq
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B',
    provider: 'Groq',
    description: 'OpenAI GPT-OSS 20B - 高速軽量オープンウェイトモデル',
    maxTokens: 131072,
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT-OSS 120B',
    provider: 'Groq',
    description: 'OpenAI GPT-OSS 120B - 高性能オープンウェイトモデル',
    maxTokens: 131072,
  },
  // OpenAI
  {
    id: 'gpt-5.4-mini',
    name: 'GPT-5.4 Mini',
    provider: 'OpenAI',
    description: 'レイテンシ重視、コスト重視、実運用の高速処理',
    maxTokens: 1047576,
  },
  {
    id: 'gpt-5.4-nano',
    name: 'GPT-5.4 Nano',
    provider: 'OpenAI',
    description: '大量処理、単純タスク、低コスト最優先',
    maxTokens: 1047576,
  },
];

export const DEFAULT_MODEL_ID = 'openai/gpt-oss-20b';

