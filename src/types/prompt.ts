export interface PromptVersion {
  id: string;
  version: number;
  content: string;
  createdAt: string;
  createdBy: string;
  description: string;
}

export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  maxTokens: number;
}

export interface PromptExecutionResult {
  id: string;
  output: string;
  model: string;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  executedAt: string;
}

export type PromptStatus = 'draft' | 'published' | 'archived';

export interface Prompt {
  id: string;
  name: string;
  description: string;
  content: string;
  modelId: string;
  status: PromptStatus;
  latestVersion: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
