import OpenAI from 'openai';
import Groq from 'groq-sdk';
import { LLM_MODELS } from '@/constants/models';

function getProvider(modelId: string): string {
  const model = LLM_MODELS.find((m) => m.id === modelId);
  return model?.provider ?? 'OpenAI';
}

/**
 * Replace {{variable}} placeholders in prompt with provided values
 */
export function substituteVariables(
  prompt: string,
  variables: Record<string, string>
): string {
  let result = prompt;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

/**
 * Extract variable names from a prompt template
 */
export function extractVariables(prompt: string): string[] {
  const matches = prompt.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))];
}

export interface LLMExecutionResult {
  output: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export async function executeLLM(
  modelId: string,
  systemPrompt: string,
  userInput: string
): Promise<LLMExecutionResult> {
  const provider = getProvider(modelId);

  // Build the messages
  const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
  if (systemPrompt && userInput) {
    messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: userInput });
  } else {
    // If no user input, treat prompt as user message
    messages.push({ role: 'user', content: systemPrompt || userInput });
  }

  if (provider === 'Groq') {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: modelId,
      messages,
    });
    const choice = response.choices[0];
    return {
      output: choice?.message?.content ?? '',
      promptTokens: response.usage?.prompt_tokens ?? 0,
      completionTokens: response.usage?.completion_tokens ?? 0,
      totalTokens: response.usage?.total_tokens ?? 0,
    };
  }

  // Default: OpenAI
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.chat.completions.create({
    model: modelId, // Azure uses the deployment name as model
    messages,
  });
  const choice = response.choices[0];
  return {
    output: choice?.message?.content ?? '',
    promptTokens: response.usage?.prompt_tokens ?? 0,
    completionTokens: response.usage?.completion_tokens ?? 0,
    totalTokens: response.usage?.total_tokens ?? 0,
  };
}
