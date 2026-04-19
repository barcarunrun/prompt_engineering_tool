import { LLMModel } from '@/types/prompt';

export const LLM_MODELS: LLMModel[] = [
  // OpenAI
  {
    id: 'gpt-5.4',
    name: 'GPT-5.4',
    provider: 'OpenAI',
    description: '汎用、複雑な推論、コーディング、エージェント処理',
    maxTokens: 1047576,
  },
  {
    id: 'gpt-5.4-pro',
    name: 'GPT-5.4 Pro',
    provider: 'OpenAI',
    description: '難問、より高い精度が必要な処理',
    maxTokens: 1047576,
  },
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
  // Groq
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B',
    provider: 'Groq',
    description: 'Meta Llama 3.3 70B - 汎用高性能モデル',
    maxTokens: 131072,
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B',
    provider: 'Groq',
    description: 'Meta Llama 3.1 8B - 高速軽量モデル',
    maxTokens: 131072,
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT-OSS 120B',
    provider: 'Groq',
    description: 'OpenAI GPT-OSS 120B - 高性能オープンウェイトモデル',
    maxTokens: 131072,
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B',
    provider: 'Groq',
    description: 'OpenAI GPT-OSS 20B - 高速軽量オープンウェイトモデル',
    maxTokens: 131072,
  },
  {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout 17B',
    provider: 'Groq',
    description: 'Meta Llama 4 Scout - マルチモーダル対応（プレビュー）',
    maxTokens: 131072,
  },
  {
    id: 'qwen/qwen3-32b',
    name: 'Qwen3 32B',
    provider: 'Groq',
    description: 'Alibaba Qwen3 32B - 高性能中型モデル（プレビュー）',
    maxTokens: 131072,
  },
];

export const DEFAULT_MODEL_ID = 'gpt-5.4';

